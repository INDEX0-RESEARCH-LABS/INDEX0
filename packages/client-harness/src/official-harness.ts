/**
 * Official Benchmark Harness Invocation
 * 
 * Invokes pinned, official evaluation pathways (SWE-bench, AiderBench)
 * instead of local smoke checks. Separates runner from evaluator.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

export interface IOfficialHarnessConfig {
  // SWE-bench
  sweBench?: {
    dataset: 'princeton-nlp/SWE-bench_Lite' | 'princeton-nlp/SWE-bench_Verified' | 'princeton-nlp/SWE-bench_Pro';
    split: 'test';
    instances?: string[]; // Specific instance IDs, or all
    maxInstances?: number;
    dockerImagePrefix?: string;
    runtime: 'docker' | 'remote';
    remoteRuntimeUrl?: string;
    apiKey?: string;
    agentClass: 'CodeActAgent';
    maxIterations: number;
    llmConfig: string; // e.g., 'llm.eval_claude_35_sonnet'
    evalOutputDir: string;
    numWorkers: number;
  };
  
  // AiderBench
  aiderBench?: {
    dataset: 'RajMaheshwari/Exercism-Python';
    split: 'train';
    instances?: string[];
    maxInstances?: number;
    useUnitTests: boolean;
    agentClass: 'CodeActAgent';
    maxIterations: number;
    llmConfig: string;
    evalOutputDir: string;
    numWorkers: number;
  };
}

export interface IHarnessRunResult {
  success: boolean;
  outputDir: string;
  outputFile: string; // JSONL with per-instance results
  summaryFile?: string; // Summary JSON
  error?: string;
  durationMs: number;
}

export interface IEvaluationSummary {
  dataset: string;
  totalInstances: number;
  resolvedInstances: number;
  passRate: number;
  ci95: [number, number];
  perInstance: Array<{
    instanceId: string;
    status: 'RESOLVED' | 'FAILED' | 'ERROR' | 'TIMEOUT';
    patchGenerated: boolean;
    testsPassed: boolean;
    hiddenTestsPassed?: boolean;
    durationMs: number;
    tokensUsed?: number;
    costUsd?: number;
  }>;
}

/**
 * Check if official harness dependencies are available
 */
export async function checkHarnessAvailability(): Promise<{
  sweBench: boolean;
  aiderBench: boolean;
  details: string[];
}> {
  const details: string[] = [];
  let sweBench = false;
  let aiderBench = false;

  // Check for OpenHands installation (agent-canvas)
  const agentCanvasPath = path.join(process.cwd(), 'agent-canvas');
  try {
    await fs.access(agentCanvasPath);
    details.push(`agent-canvas found at ${agentCanvasPath}`);
    
    // Check for SWE-bench scripts
    const sweScript = path.join(agentCanvasPath, 'evaluation/benchmarks/swe_bench/scripts/run_infer.sh');
    try {
      await fs.access(sweScript);
      sweBench = true;
      details.push('SWE-bench harness scripts found');
    } catch {
      details.push('SWE-bench harness scripts NOT found');
    }
    
    // Check for AiderBench scripts
    const aiderScript = path.join(agentCanvasPath, 'evaluation/benchmarks/aider_bench/scripts/run_infer.sh');
    try {
      await fs.access(aiderScript);
      aiderBench = true;
      details.push('AiderBench harness scripts found');
    } catch {
      details.push('AiderBench harness scripts NOT found');
    }
  } catch {
    details.push('agent-canvas directory not found');
  }

  // Check for Poetry
  try {
    execSync('poetry --version', { stdio: 'ignore' });
    details.push('Poetry available');
  } catch {
    details.push('Poetry NOT available');
  }

  // Check for Docker
  try {
    execSync('docker --version', { stdio: 'ignore' });
    details.push('Docker available');
  } catch {
    details.push('Docker NOT available');
  }

  return { sweBench, aiderBench, details };
}

/**
 * Run SWE-bench official evaluation via OpenHands harness
 * 
 * This invokes the OFFICIAL Princeton SWE-bench evaluation pathway,
 * not a local reproduction. Requires:
 * - OpenHands (agent-canvas) installed with dependencies
 * - Docker or remote runtime access
 * - LLM API credentials
 * - Sufficient compute/time budget
 */
export async function runOfficialSWEBench(
  config: IOfficialHarnessConfig['sweBench'],
  runDir: string
): Promise<IHarnessRunResult> {
  if (!config) {
    return { success: false, outputDir: '', outputFile: '', error: 'No SWE-bench config provided', durationMs: 0 };
  }

  const startTime = Date.now();
  const agentCanvasPath = path.join(process.cwd(), 'agent-canvas');
  const scriptPath = path.join(agentCanvasPath, 'evaluation/benchmarks/swe_bench/scripts/run_infer.sh');

  // Verify script exists
  try {
    await fs.access(scriptPath);
  } catch {
    return { 
      success: false, 
      outputDir: '', 
      outputFile: '', 
      error: `SWE-bench harness script not found at ${scriptPath}. Run from repository root with agent-canvas installed.`, 
      durationMs: Date.now() - startTime 
    };
  }

  // Build command arguments
  const args = [
    config.llmConfig,
    'HEAD', // version
    config.agentClass,
    config.maxInstances?.toString() || '300',
    config.maxIterations.toString(),
    config.numWorkers.toString(),
    config.dataset,
    config.split
  ];

  const env: Record<string, string | undefined> = {
    ...process.env,
    RUNTIME: config.runtime,
    ALLHANDS_API_KEY: config.apiKey || process.env.ALLHANDS_API_KEY,
    SANDBOX_REMOTE_RUNTIME_API_URL: config.remoteRuntimeUrl || process.env.SANDBOX_REMOTE_RUNTIME_API_URL,
    EVAL_DOCKER_IMAGE_PREFIX: config.dockerImagePrefix || process.env.EVAL_DOCKER_IMAGE_PREFIX,
    USE_HINT_TEXT: 'false',
    USE_INSTANCE_IMAGE: 'false',
    RUN_WITH_BROWSING: 'false'
  };

  // Remove undefined env vars
  Object.keys(env).forEach(key => env[key] === undefined && delete env[key]);

  console.log(`[SWE-bench] Starting official evaluation...`);
  console.log(`[SWE-bench] Command: cd ${agentCanvasPath} && ./evaluation/benchmarks/swe_bench/scripts/run_infer.sh ${args.join(' ')}`);
  console.log(`[SWE-bench] Runtime: ${config.runtime}, Workers: ${config.numWorkers}`);

  try {
    // Run inference
    const inferResult = execSync(
      `./evaluation/benchmarks/swe_bench/scripts/run_infer.sh ${args.join(' ')}`,
      {
        cwd: agentCanvasPath,
        env,
        encoding: 'utf-8',
        maxBuffer: 100 * 1024 * 1024, // 100MB
        timeout: 24 * 60 * 60 * 1000 // 24 hours
      }
    );

    console.log(`[SWE-bench] Inference completed`);
    console.log(inferResult.slice(-2000)); // Last 2000 chars

    // Find output directory
    const outputBase = path.join(agentCanvasPath, 'evaluation/evaluation_outputs/outputs');
    const datasetSlug = config.dataset.replace('/', '__').replace('-', '_') + '-' + config.split;
    const agentSlug = `${config.agentClass}`;
    
    // The output directory pattern: .../outputs/<dataset>/<agent>/<llm_config>_maxiter_<N>_N_<limit>-<hint>-run_<n>
    const outputDirs = await findOutputDirectories(outputBase, datasetSlug, agentSlug, config.llmConfig);
    
    if (outputDirs.length === 0) {
      return {
        success: false,
        outputDir: '',
        outputFile: '',
        error: 'No output directory found after inference',
        durationMs: Date.now() - startTime
      };
    }

    const latestOutputDir = outputDirs.sort().pop()!;
    const outputFile = path.join(latestOutputDir, 'output.jsonl');

    // Run official evaluation (eval_infer.sh)
    console.log(`[SWE-bench] Running official evaluation on ${outputFile}...`);
    
    const evalScript = path.join(agentCanvasPath, 'evaluation/benchmarks/swe_bench/scripts/eval_infer.sh');
    const evalResult = execSync(
      `${evalScript} ${outputFile} ${config.numWorkers} ${config.dataset} ${config.split}`,
      {
        cwd: agentCanvasPath,
        env,
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024,
        timeout: 12 * 60 * 60 * 1000 // 12 hours
      }
    );

    console.log(`[SWE-bench] Official evaluation completed`);
    console.log(evalResult.slice(-2000));

    // Parse summary
    const summaryFile = path.join(latestOutputDir, 'summary.json');
    let summary: IEvaluationSummary | undefined;
    try {
      const summaryContent = await fs.readFile(summaryFile, 'utf-8');
      summary = JSON.parse(summaryContent);
    } catch {
      // Generate summary from output.jsonl if summary.json doesn't exist
      summary = await generateSummaryFromOutput(outputFile, config.dataset);
    }

    // Save summary to run directory
    const runSummaryPath = path.join(runDir, 'swe_bench_summary.json');
    await fs.writeFile(runSummaryPath, JSON.stringify(summary, null, 2), 'utf-8');

    return {
      success: true,
      outputDir: latestOutputDir,
      outputFile,
      summaryFile: runSummaryPath,
      durationMs: Date.now() - startTime
    };

  } catch (error: any) {
    return {
      success: false,
      outputDir: '',
      outputFile: '',
      error: `SWE-bench evaluation failed: ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`,
      durationMs: Date.now() - startTime
    };
  }
}

/**
 * Run AiderBench official evaluation via OpenHands harness
 */
export async function runOfficialAiderBench(
  config: IOfficialHarnessConfig['aiderBench'],
  runDir: string
): Promise<IHarnessRunResult> {
  if (!config) {
    return { success: false, outputDir: '', outputFile: '', error: 'No AiderBench config provided', durationMs: 0 };
  }

  const startTime = Date.now();
  const agentCanvasPath = path.join(process.cwd(), 'agent-canvas');
  const scriptPath = path.join(agentCanvasPath, 'evaluation/benchmarks/aider_bench/scripts/run_infer.sh');

  try {
    await fs.access(scriptPath);
  } catch {
    return {
      success: false,
      outputDir: '',
      outputFile: '',
      error: `AiderBench harness script not found at ${scriptPath}`,
      durationMs: Date.now() - startTime
    };
  }

  const args = [
    config.llmConfig,
    'HEAD',
    config.agentClass,
    config.maxInstances?.toString() || '133',
    config.numWorkers.toString()
  ];

  const env: Record<string, string | undefined> = {
    ...process.env,
    RUNTIME: 'docker',
    USE_UNIT_TESTS: config.useUnitTests ? 'true' : 'false',
    ALLHANDS_API_KEY: process.env.ALLHANDS_API_KEY,
    SANDBOX_REMOTE_RUNTIME_API_URL: process.env.SANDBOX_REMOTE_RUNTIME_API_URL
  };

  Object.keys(env).forEach(key => env[key] === undefined && delete env[key]);

  console.log(`[AiderBench] Starting official evaluation...`);
  console.log(`[AiderBench] Command: cd ${agentCanvasPath} && ./evaluation/benchmarks/aider_bench/scripts/run_infer.sh ${args.join(' ')}`);

  try {
    const result = execSync(
      `./evaluation/benchmarks/aider_bench/scripts/run_infer.sh ${args.join(' ')}`,
      {
        cwd: agentCanvasPath,
        env,
        encoding: 'utf-8',
        maxBuffer: 100 * 1024 * 1024,
        timeout: 12 * 60 * 60 * 1000
      }
    );

    console.log(`[AiderBench] Evaluation completed`);
    console.log(result.slice(-2000));

    // Find output
    const outputBase = path.join(agentCanvasPath, 'evaluation/evaluation_outputs/outputs');
    const outputDirs = await findOutputDirectories(outputBase, 'AiderBench', config.agentClass, config.llmConfig);
    
    if (outputDirs.length === 0) {
      return {
        success: false,
        outputDir: '',
        outputFile: '',
        error: 'No output directory found after AiderBench inference',
        durationMs: Date.now() - startTime
      };
    }

    const latestOutputDir = outputDirs.sort().pop()!;
    const outputFile = path.join(latestOutputDir, 'output.jsonl');

    // Generate summary
    const summary = await generateSummaryFromOutput(outputFile, config.dataset);

    const runSummaryPath = path.join(runDir, 'aider_bench_summary.json');
    await fs.writeFile(runSummaryPath, JSON.stringify(summary, null, 2), 'utf-8');

    return {
      success: true,
      outputDir: latestOutputDir,
      outputFile,
      summaryFile: runSummaryPath,
      durationMs: Date.now() - startTime
    };

  } catch (error: any) {
    return {
      success: false,
      outputDir: '',
      outputFile: '',
      error: `AiderBench evaluation failed: ${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`,
      durationMs: Date.now() - startTime
    };
  }
}

/**
 * Find output directories matching pattern
 */
async function findOutputDirectories(
  baseDir: string,
  datasetSlug: string,
  agentSlug: string,
  llmConfig: string
): Promise<string[]> {
  const dirs: string[] = [];
  
  try {
    const datasetPath = path.join(baseDir, datasetSlug);
    await fs.access(datasetPath);
    
    const agentPath = path.join(datasetPath, agentSlug);
    await fs.access(agentPath);
    
    const entries = await fs.readdir(agentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.includes(llmConfig.replace('.', '_'))) {
        dirs.push(path.join(agentPath, entry.name));
      }
    }
  } catch {
    // Directory not found
  }
  
  return dirs;
}

/**
 * Generate evaluation summary from output.jsonl
 */
async function generateSummaryFromOutput(
  outputFile: string,
  dataset: string
): Promise<IEvaluationSummary> {
  const content = await fs.readFile(outputFile, 'utf-8');
  const lines = content.trim().split('\n').filter(l => l.length > 0);
  
  const perInstance: IEvaluationSummary['perInstance'] = [];
  let resolved = 0;
  
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      const instanceId = data.instance_id || data.instanceId;
      const testResult = data.test_result || {};
      const gitPatch = testResult.git_patch || data.git_patch;
      const exitCode = testResult.exit_code;
      
      const status = gitPatch && gitPatch.length > 0 && exitCode === 0 ? 'RESOLVED' : 'FAILED';
      if (status === 'RESOLVED') resolved++;
      
      perInstance.push({
        instanceId,
        status: status as any,
        patchGenerated: !!gitPatch && gitPatch.length > 0,
        testsPassed: exitCode === 0,
        durationMs: data.metrics?.total_time_ms || 0,
        tokensUsed: data.metrics?.total_tokens || 0,
        costUsd: data.metrics?.total_cost || 0
      });
    } catch {
      // Skip malformed lines
    }
  }

  // Wilson score interval for 95% CI
  const n = perInstance.length;
  const p = resolved / n;
  const z = 1.96;
  const denominator = 1 + z * z / n;
  const center = (p + z * z / (2 * n)) / denominator;
  const halfWidth = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / denominator;
  const ci95: [number, number] = [
    Math.max(0, center - halfWidth),
    Math.min(1, center + halfWidth)
  ];

  return {
    dataset,
    totalInstances: n,
    resolvedInstances: resolved,
    passRate: n > 0 ? p : 0,
    ci95,
    perInstance
  };
}

/**
 * Check if infrastructure is available for official runs
 * Returns BLOCKED status with details if not available
 */
export async function checkOfficialRunFeasibility(): Promise<{
  feasible: boolean;
  blockedReasons: string[];
  requirements: string[];
}> {
  const blockedReasons: string[] = [];
  const requirements: string[] = [];

  // Check agent-canvas
  const agentCanvasPath = path.join(process.cwd(), 'agent-canvas');
  try {
    await fs.access(agentCanvasPath);
  } catch {
    blockedReasons.push('agent-canvas directory not found (run `git submodule update --init` or clone OpenHands)');
    requirements.push('agent-canvas/OpenHands repository');
  }

  // Check Poetry
  try {
    execSync('poetry --version', { stdio: 'ignore' });
  } catch {
    blockedReasons.push('Poetry not installed (required for OpenHands dependencies)');
    requirements.push('Poetry package manager');
  }

  // Check Docker
  try {
    execSync('docker --version', { stdio: 'ignore' });
  } catch {
    blockedReasons.push('Docker not available (required for SWE-bench containerized evaluation)');
    requirements.push('Docker Engine');
  }

  // Check API credentials (supports Anthropic, OpenAI, Azure OpenAI, All Hands remote)
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAzure = !!process.env.AZURE_OPENAI_API_KEY && !!process.env.AZURE_OPENAI_ENDPOINT;
  const hasAllHands = !!process.env.ALLHANDS_API_KEY;

  if (!hasAllHands && !hasAnthropic && !hasOpenAI && !hasAzure) {
    blockedReasons.push('No LLM API credentials found (need ALLHANDS_API_KEY for remote runtime, or ANTHROPIC_API_KEY/OPENAI_API_KEY for local, or AZURE_OPENAI_API_KEY+AZURE_OPENAI_ENDPOINT for Azure)');
    requirements.push('LLM API credentials (Anthropic, OpenAI, Azure OpenAI, or All Hands remote runtime)');
  }

  // Check network access (required for dataset download)
  try {
    // Quick connectivity test
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    await fetch('https://huggingface.co', { signal: controller.signal, method: 'HEAD' });
    clearTimeout(timeout);
  } catch {
    blockedReasons.push('No network access to Hugging Face (required for dataset download)');
    requirements.push('Network access to huggingface.co and docker registries');
  }

  return {
    feasible: blockedReasons.length === 0,
    blockedReasons,
    requirements
  };
}

/**
 * Create a BLOCKED result for reporting
 */
export function createBlockedResult(reason: string, _requirements: string[]): IHarnessRunResult {
  return {
    success: false,
    outputDir: '',
    outputFile: '',
    error: `BLOCKED: ${reason}`,
    durationMs: 0
  };
}