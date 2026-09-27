/**
 * Anti-Cheat Detection for Benchmark Evaluation
 * 
 * Detects:
 * - Test modifications to hide failures
 * - Test deletions
 * - Weakened assertions
 * - Evaluator code modifications
 * - Benchmark infrastructure modifications
 * - Network retrieval of hidden answers
 * - Hardcoded expected outputs
 * - Test suite bypassing
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

export interface IAntiCheatBaseline {
  testFiles: Map<string, string>; // path -> hash
  evaluatorFiles: Map<string, string>;
  benchmarkInfraFiles: Map<string, string>;
  testSuiteHash: string;
  createdAt: string;
}

export interface ICheatDetectionResult {
  clean: boolean;
  violations: ICheatViolation[];
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ICheatViolation {
  type: 'test_modified' | 'test_deleted' | 'assertion_weakened' | 'evaluator_modified' | 
        'benchmark_modified' | 'network_access' | 'hardcoded_output' | 'test_bypassed';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  file: string;
  description: string;
  evidence: string;
  baselineHash?: string;
  currentHash?: string;
}

/**
 * Create baseline snapshot of test/evaluator files before agent runs
 */
export async function createAntiCheatBaseline(
  testDir: string,
  evaluatorDir: string,
  benchmarkInfraDir: string
): Promise<IAntiCheatBaseline> {
  const testFiles = new Map<string, string>();
  const evaluatorFiles = new Map<string, string>();
  const benchmarkInfraFiles = new Map<string, string>();

  async function hashFiles(dir: string, fileMap: Map<string, string>, extensions: string[] = ['.py', '.js', '.ts', '.json', '.sh']) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await hashFiles(fullPath, fileMap, extensions);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const hash = crypto.createHash('sha256').update(content).digest('hex');
          fileMap.set(fullPath, hash);
        }
      }
    } catch {
      // Directory may not exist
    }
  }

  await hashFiles(testDir, testFiles);
  await hashFiles(evaluatorDir, evaluatorFiles);
  await hashFiles(benchmarkInfraDir, benchmarkInfraFiles);

  // Create combined test suite hash
  const allTestHashes = Array.from(testFiles.values()).sort().join('');
  const testSuiteHash = crypto.createHash('sha256').update(allTestHashes).digest('hex');

  return {
    testFiles,
    evaluatorFiles,
    benchmarkInfraFiles,
    testSuiteHash,
    createdAt: new Date().toISOString()
  };
}

/**
 * Save baseline to disk
 */
export async function saveBaseline(baseline: IAntiCheatBaseline, outputPath: string): Promise<void> {
  const serializable = {
    testFiles: Array.from(baseline.testFiles.entries()),
    evaluatorFiles: Array.from(baseline.evaluatorFiles.entries()),
    benchmarkInfraFiles: Array.from(baseline.benchmarkInfraFiles.entries()),
    testSuiteHash: baseline.testSuiteHash,
    createdAt: baseline.createdAt
  };
  await fs.writeFile(outputPath, JSON.stringify(serializable, null, 2), 'utf-8');
}

/**
 * Load baseline from disk
 */
export async function loadBaseline(inputPath: string): Promise<IAntiCheatBaseline> {
  const content = await fs.readFile(inputPath, 'utf-8');
  const data = JSON.parse(content);
  return {
    testFiles: new Map(data.testFiles),
    evaluatorFiles: new Map(data.evaluatorFiles),
    benchmarkInfraFiles: new Map(data.benchmarkInfraFiles),
    testSuiteHash: data.testSuiteHash,
    createdAt: data.createdAt
  };
}

/**
 * Detect assertion weakening in test files
 */
function detectWeakenedAssertions(_oldContent: string, newContent: string): ICheatViolation[] {
  const violations: ICheatViolation[] = [];
  
  // Patterns that indicate weakened assertions
  const weakeningPatterns = [
    { pattern: /assert\s+(.+?)\s*==\s*(.+?)\s*#\s*was:\s*(.+)/g, desc: 'Assertion changed with comment indicating previous stricter version' },
    { pattern: /assert\s+True\s*#\s*was:\s*assert\s+.+/g, desc: 'Assertion weakened to assert True' },
    { pattern: /pytest\.skip\(/g, desc: 'Test skipped with pytest.skip' },
    { pattern: /@pytest\.mark\.skip/g, desc: 'Test marked as skipped' },
    { pattern: /unittest\.skip\(/g, desc: 'Test skipped with unittest.skip' },
    { pattern: /assert\s+(.+?)\s*in\s+\[.+\]\s*#\s*was:\s*assert\s+(.+?)\s*==/g, desc: 'Exact equality weakened to membership check' },
    { pattern: /assert\s+len\(.+\)\s*>=\s*0/g, desc: 'Trivial length assertion (always true)' },
    { pattern: /try:.*except:.*pass/g, desc: 'Empty exception handler swallowing failures' },
  ];

  for (const { pattern, desc } of weakeningPatterns) {
    const matches = newContent.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        type: 'assertion_weakened',
        severity: 'WARNING',
        file: '', // Will be set by caller
        description: desc,
        evidence: match[0]
      });
    }
  }

  return violations;
}

/**
 * Detect hardcoded expected outputs
 */
function detectHardcodedOutputs(content: string, filePath: string): ICheatViolation[] {
  const violations: ICheatViolation[] = [];
  
  // Patterns suggesting hardcoded answers to benchmark tasks
  const suspiciousPatterns = [
    { pattern: /expected_output\s*=\s*["'][^"']{50,}["']/g, desc: 'Long hardcoded expected output string' },
    { pattern: /answer\s*=\s*["'][^"']{50,}["']/g, desc: 'Hardcoded answer string' },
    { pattern: /solution\s*=\s*["'][^"']{50,}["']/g, desc: 'Hardcoded solution string' },
    { pattern: /#\s*benchmark\s+answer/g, desc: 'Comment referencing benchmark answer' },
    { pattern: /#\s*expected\s+result/g, desc: 'Comment referencing expected result' },
  ];

  for (const { pattern, desc } of suspiciousPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        type: 'hardcoded_output',
        severity: 'WARNING',
        file: filePath,
        description: desc,
        evidence: match[0].slice(0, 200)
      });
    }
  }

  return violations;
}

/**
 * Detect test bypassing
 */
function detectTestBypass(content: string, filePath: string): ICheatViolation[] {
  const violations: ICheatViolation[] = [];
  
  const bypassPatterns = [
    { pattern: /sys\.exit\(0\)/g, desc: 'Early exit with success code' },
    { pattern: /process\.exit\(0\)/g, desc: 'Early exit with success code (Node)' },
    { pattern: /raise SystemExit\(0\)/g, desc: 'Early exit with success code (Python)' },
    { pattern: /return\s+true\s*;?\s*\/\/.*benchmark/g, desc: 'Hardcoded true return for benchmark' },
  ];

  for (const { pattern, desc } of bypassPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        type: 'test_bypassed',
        severity: 'ERROR',
        file: filePath,
        description: desc,
        evidence: match[0].slice(0, 200)
      });
    }
  }

  return violations;
}

/**
 * Run anti-cheat detection comparing current state to baseline
 */
export async function detectCheating(
  baseline: IAntiCheatBaseline,
  testDir: string,
  _evaluatorDir: string,
  _benchmarkInfraDir: string
): Promise<ICheatDetectionResult> {
  const violations: ICheatViolation[] = [];

  // Check test files
  for (const [filePath, baselineHash] of baseline.testFiles) {
    try {
      const currentContent = await fs.readFile(filePath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');
      
      if (currentHash !== baselineHash) {
        // File modified - check what changed
        violations.push({
          type: 'test_modified',
          severity: 'WARNING',
          file: filePath,
          description: 'Test file modified after baseline',
          evidence: `Hash changed from ${baselineHash.slice(0, 16)} to ${currentHash.slice(0, 16)}`,
          baselineHash,
          currentHash
        });

        // Check for specific weakening patterns
        const weakenViolations = detectWeakenedAssertions('', currentContent);
        for (const v of weakenViolations) {
          v.file = filePath;
          violations.push(v);
        }

        const hardcodedViolations = detectHardcodedOutputs(currentContent, filePath);
        violations.push(...hardcodedViolations);

        const bypassViolations = detectTestBypass(currentContent, filePath);
        violations.push(...bypassViolations);
      }
    } catch {
      // File deleted
      violations.push({
        type: 'test_deleted',
        severity: 'ERROR',
        file: filePath,
        description: 'Test file deleted after baseline',
        evidence: `Baseline hash: ${baselineHash.slice(0, 16)}`,
        baselineHash
      });
    }
  }

  // Check for new test files not in baseline (could be legitimate, but flag for review)
  try {
    const currentTestFiles = new Map<string, string>();
    await hashDir(testDir, currentTestFiles);
    for (const [filePath] of currentTestFiles) {
      if (!baseline.testFiles.has(filePath)) {
        violations.push({
          type: 'test_modified',
          severity: 'INFO',
          file: filePath,
          description: 'New test file not in baseline',
          evidence: 'File added after baseline creation'
        });
      }
    }
  } catch {
    // Ignore
  }

  // Check evaluator files
  for (const [filePath, baselineHash] of baseline.evaluatorFiles) {
    try {
      const currentContent = await fs.readFile(filePath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');
      
      if (currentHash !== baselineHash) {
        violations.push({
          type: 'evaluator_modified',
          severity: 'CRITICAL',
          file: filePath,
          description: 'Evaluator code modified after baseline',
          evidence: `Hash changed from ${baselineHash.slice(0, 16)} to ${currentHash.slice(0, 16)}`,
          baselineHash,
          currentHash
        });
      }
    } catch {
      violations.push({
        type: 'evaluator_modified',
        severity: 'CRITICAL',
        file: filePath,
        description: 'Evaluator file deleted after baseline',
        evidence: `Baseline hash: ${baselineHash.slice(0, 16)}`,
        baselineHash
      });
    }
  }

  // Check benchmark infrastructure files
  for (const [filePath, baselineHash] of baseline.benchmarkInfraFiles) {
    try {
      const currentContent = await fs.readFile(filePath, 'utf-8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');
      
      if (currentHash !== baselineHash) {
        violations.push({
          type: 'benchmark_modified',
          severity: 'CRITICAL',
          file: filePath,
          description: 'Benchmark infrastructure modified after baseline',
          evidence: `Hash changed from ${baselineHash.slice(0, 16)} to ${currentHash.slice(0, 16)}`,
          baselineHash,
          currentHash
        });
      }
    } catch {
      violations.push({
        type: 'benchmark_modified',
        severity: 'CRITICAL',
        file: filePath,
        description: 'Benchmark infrastructure file deleted after baseline',
        evidence: `Baseline hash: ${baselineHash.slice(0, 16)}`,
        baselineHash
      });
    }
  }

  // Determine overall risk level
  const criticalCount = violations.filter(v => v.severity === 'CRITICAL').length;
  const errorCount = violations.filter(v => v.severity === 'ERROR').length;
  const warningCount = violations.filter(v => v.severity === 'WARNING').length;

  let riskLevel: ICheatDetectionResult['riskLevel'] = 'NONE';
  if (criticalCount > 0) riskLevel = 'CRITICAL';
  else if (errorCount > 0) riskLevel = 'HIGH';
  else if (warningCount > 0) riskLevel = 'MEDIUM';
  else if (violations.length > 0) riskLevel = 'LOW';

  return {
    clean: violations.length === 0,
    violations,
    riskLevel
  };
}

async function hashDir(dir: string, fileMap: Map<string, string>, _extensions: string[] = ['.py', '.js', '.ts', '.json', '.sh']): Promise<void> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await hashDir(fullPath, fileMap, _extensions);
      } else if (entry.isFile() && _extensions.some((ext: string) => entry.name.endsWith(ext))) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        fileMap.set(fullPath, hash);
      }
    }
  } catch {
    // Directory may not exist
  }
}

/**
 * Check for network access during evaluation (requires runtime monitoring)
 * This is a placeholder - real implementation would hook into runtime
 */
export function checkNetworkAccess(): { accessed: boolean; domains: string[] } {
  // In a real implementation, this would check network logs from sandbox
  return { accessed: false, domains: [] };
}

/**
 * Generate INVALID_RUN status if cheating detected
 */
export function createInvalidRunStatus(violations: ICheatViolation[]): string {
  const critical = violations.filter(v => v.severity === 'CRITICAL').map(v => v.type);
  const error = violations.filter(v => v.severity === 'ERROR').map(v => v.type);
  
  return `INVALID_RUN: ${[...critical, ...error].join(', ')}`;
}