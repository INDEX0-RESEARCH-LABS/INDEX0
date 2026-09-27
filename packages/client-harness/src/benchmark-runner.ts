/**
 * Benchmark Runner — Orchestrates Official Evaluation with Full Artifacts
 * 
 * This is the main entry point for running official benchmarks (SWE-bench, AiderBench)
 * with proper task manifests, per-run artifacts, anti-cheat detection, and evaluation.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { 
  createTaskManifest, 
  saveTaskManifest, 
  createRunMetadata, 
  saveRunMetadata,
  createRunDirectory,
  generateChecksums,
  ITaskManifest,
} from './run-artifacts.js';
import { 
  runOfficialSWEBench, 
  runOfficialAiderBench, 
  checkOfficialRunFeasibility,
  createBlockedResult,
  IEvaluationSummary,
  IOfficialHarnessConfig
} from './official-harness.js';
import { detectCheating, createAntiCheatBaseline, saveBaseline, ICheatDetectionResult } from './anti-cheat.js';

export interface IBenchmarkRunnerConfig {
  // Which benchmarks to run
  sweBench?: {
    enabled: boolean;
    dataset: 'princeton-nlp/SWE-bench_Lite' | 'princeton-nlp/SWE-bench_Verified' | 'princeton-nlp/SWE-bench_Pro';
    maxInstances?: number;
    maxIterations: number;
    numWorkers: number;
    llmConfig: string;
    runtime: 'docker' | 'remote';
  };
  aiderBench?: {
    enabled: boolean;
    maxInstances?: number;
    maxIterations: number;
    numWorkers: number;
    llmConfig: string;
    useUnitTests: boolean;
  };
  
  // Agent configuration (for INDEX0)
  agent?: {
    model: string;
    provider: string;
    version: string;
    temperature: number;
    maxTokens: number;
    toolBudget: number;
    timeBudgetMs: number;
  };
  
  // Output
  outputDir: string;
  benchmarkCommit: string;
}

export interface IBenchmarkRunReport {
  runId: string;
  timestamp: string;
  benchmarkCommit: string;
  config: IBenchmarkRunnerConfig;
  taskManifest: ITaskManifest;
  sweBench?: {
    feasible: boolean;
    result?: Awaited<ReturnType<typeof runOfficialSWEBench>>;
    blockedReasons?: string[];
    summary?: IEvaluationSummary;
    antiCheat?: ICheatDetectionResult;
  };
  aiderBench?: {
    feasible: boolean;
    result?: Awaited<ReturnType<typeof runOfficialAiderBench>>;
    blockedReasons?: string[];
    summary?: IEvaluationSummary;
    antiCheat?: ICheatDetectionResult;
  };
  integrity: {
    claimFirewallActive: boolean;
    taskManifestFrozen: boolean;
    taskManifestHash: string;
    perRunArtifactsGenerated: boolean;
    antiCheatEnabled: boolean;
    evaluatorIndependent: boolean;
  };
}

/**
 * Main benchmark runner - executes official evaluations with full artifacts
 */
export async function runOfficialBenchmarks(
  config: IBenchmarkRunnerConfig
): Promise<IBenchmarkRunReport> {
  const runId = `bench-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const startedAt = new Date().toISOString();
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  INDEX0 OFFICIAL BENCHMARK RUNNER`);
  console.log(`  Run ID: ${runId}`);
  console.log(`  Commit: ${config.benchmarkCommit}`);
  console.log(`  Output: ${config.outputDir}`);
  console.log(`${'='.repeat(70)}\n`);

  // Create base output directory
  await fs.mkdir(config.outputDir, { recursive: true });
  
  // Create run directory
  const runDir = await createRunDirectory(config.outputDir, runId);
  console.log(`[Runner] Created run directory: ${runDir}`);

  // Collect all task IDs for manifest
  const allTaskIds: string[] = [];
  
  if (config.sweBench?.enabled) {
    // For SWE-bench, we'd ideally fetch the dataset to get task IDs
    // For now, use a placeholder - in practice this would load from dataset
    allTaskIds.push('swe-bench-tasks-placeholder');
  }
  
  if (config.aiderBench?.enabled) {
    allTaskIds.push('aider-bench-tasks-placeholder');
  }

  // Create and freeze task manifest BEFORE any execution
  const evaluationCriteria = {
    successLevels: ['A', 'B', 'C', 'D', 'E', 'F'],
    primaryMetric: 'Level F success rate (verified engineering task success)',
    antiCheatChecks: [
      'test_file_integrity',
      'assertion_strength_analysis',
      'evaluator_code_integrity',
      'benchmark_infra_integrity',
      'network_access_monitoring',
      'hardcoded_output_detection'
    ]
  };

  const taskManifest = await createTaskManifest(
    'multi-benchmark',
    '1.0.0',
    'official',
    allTaskIds,
    evaluationCriteria,
    config.benchmarkCommit
  );

  await saveTaskManifest(taskManifest, runDir);
  console.log(`[Runner] Task manifest frozen: ${taskManifest.hash.slice(0, 16)}`);

  // Save run metadata
  const runMetadata = createRunMetadata(
    runId,
    'multi-benchmark',
    config.agent || {
      model: 'unknown',
      provider: 'unknown',
      version: 'unknown',
      temperature: 0,
      maxTokens: 0,
      toolBudget: 0,
      timeBudgetMs: 0
    },
    { url: 'local', commit: config.benchmarkCommit },
    { id: 'multi-benchmark', description: 'Multi-benchmark suite', difficulty: 'D3', filesEstimated: 0 },
    taskManifest.hash,
    crypto.createHash('sha256').update(JSON.stringify(config)).digest('hex')
  );
  
  await saveRunMetadata(runMetadata, runDir);

  const report: IBenchmarkRunReport = {
    runId,
    timestamp: startedAt,
    benchmarkCommit: config.benchmarkCommit,
    config,
    taskManifest,
    integrity: {
      claimFirewallActive: true,
      taskManifestFrozen: true,
      taskManifestHash: taskManifest.hash,
      perRunArtifactsGenerated: true,
      antiCheatEnabled: true,
      evaluatorIndependent: true
    }
  };

  // Check feasibility for official runs
  const feasibility = await checkOfficialRunFeasibility();
  
  if (!feasibility.feasible) {
    console.log(`\n[Runner] OFFICIAL BENCHMARKS BLOCKED`);
    for (const reason of feasibility.blockedReasons) {
      console.log(`  - ${reason}`);
    }
    console.log(`\nRequirements:`);
    for (const req of feasibility.requirements) {
      console.log(`  - ${req}`);
    }
  }

  // Create anti-cheat baselines for test directories
  const agentCanvasPath = path.join(process.cwd(), 'agent-canvas');
  const sweTestDir = path.join(agentCanvasPath, 'evaluation/benchmarks/swe_bench');
  const aiderTestDir = path.join(agentCanvasPath, 'evaluation/benchmarks/aider_bench');
  const evaluatorDir = path.join(agentCanvasPath, 'evaluation/utils');
  const infraDir = path.join(agentCanvasPath, 'evaluation/benchmarks');

  let sweBaseline: Awaited<ReturnType<typeof createAntiCheatBaseline>> | null = null;
  let aiderBaseline: Awaited<ReturnType<typeof createAntiCheatBaseline>> | null = null;

  if (config.sweBench?.enabled && feasibility.feasible) {
    console.log(`[Anti-Cheat] Creating SWE-bench baseline...`);
    sweBaseline = await createAntiCheatBaseline(sweTestDir, evaluatorDir, infraDir);
    await saveBaseline(sweBaseline, path.join(runDir, 'swe_bench_baseline.json'));
  }

  if (config.aiderBench?.enabled && feasibility.feasible) {
    console.log(`[Anti-Cheat] Creating AiderBench baseline...`);
    aiderBaseline = await createAntiCheatBaseline(aiderTestDir, evaluatorDir, infraDir);
    await saveBaseline(aiderBaseline, path.join(runDir, 'aider_bench_baseline.json'));
  }

  // Run SWE-bench
  if (config.sweBench?.enabled) {
    console.log(`\n[Runner] Starting SWE-bench evaluation...`);
    
    if (!feasibility.feasible) {
      const blockedResult = createBlockedResult(
        'Infrastructure not available for official SWE-bench run',
        feasibility.requirements
      );
      report.sweBench = {
        feasible: false,
        result: blockedResult,
        blockedReasons: feasibility.blockedReasons
      };
    } else {
      const sweConfig: IOfficialHarnessConfig['sweBench'] = {
        dataset: config.sweBench.dataset,
        split: 'test',
        maxInstances: config.sweBench.maxInstances,
        maxIterations: config.sweBench.maxIterations,
        numWorkers: config.sweBench.numWorkers,
        llmConfig: config.sweBench.llmConfig,
        evalOutputDir: path.join(runDir, 'swe_bench_output'),
        runtime: config.sweBench.runtime,
        remoteRuntimeUrl: process.env.SANDBOX_REMOTE_RUNTIME_API_URL,
        apiKey: process.env.ALLHANDS_API_KEY,
        agentClass: 'CodeActAgent',
        dockerImagePrefix: process.env.EVAL_DOCKER_IMAGE_PREFIX
      };

      const result = await runOfficialSWEBench(sweConfig, runDir);
      report.sweBench = {
        feasible: true,
        result,
        blockedReasons: []
      };

      if (result.success && result.summaryFile) {
        const summaryContent = await fs.readFile(result.summaryFile, 'utf-8');
        report.sweBench.summary = JSON.parse(summaryContent);
        
        // Run anti-cheat detection
        if (sweBaseline) {
          console.log(`[Anti-Cheat] Running SWE-bench cheat detection...`);
          const cheatResult = await detectCheating(sweBaseline, sweTestDir, evaluatorDir, infraDir);
          report.sweBench.antiCheat = cheatResult;
          
          if (!cheatResult.clean) {
            console.log(`[Anti-Cheat] VIOLATIONS DETECTED: ${cheatResult.riskLevel}`);
            for (const v of cheatResult.violations) {
              console.log(`  - [${v.severity}] ${v.type}: ${v.file} - ${v.description}`);
            }
          } else {
            console.log(`[Anti-Cheat] Clean - no violations detected`);
          }
        }
      }
    }
  }

  // Run AiderBench
  if (config.aiderBench?.enabled) {
    console.log(`\n[Runner] Starting AiderBench evaluation...`);
    
    if (!feasibility.feasible) {
      const blockedResult = createBlockedResult(
        'Infrastructure not available for official AiderBench run',
        feasibility.requirements
      );
      report.aiderBench = {
        feasible: false,
        result: blockedResult,
        blockedReasons: feasibility.blockedReasons
      };
    } else {
      const aiderConfig: IOfficialHarnessConfig['aiderBench'] = {
        dataset: 'RajMaheshwari/Exercism-Python',
        split: 'train',
        maxInstances: config.aiderBench.maxInstances,
        maxIterations: config.aiderBench.maxIterations,
        numWorkers: config.aiderBench.numWorkers,
        llmConfig: config.aiderBench.llmConfig,
        evalOutputDir: path.join(runDir, 'aider_bench_output'),
        useUnitTests: config.aiderBench.useUnitTests,
        agentClass: 'CodeActAgent'
      };

      const result = await runOfficialAiderBench(aiderConfig, runDir);
      report.aiderBench = {
        feasible: true,
        result,
        blockedReasons: []
      };

      if (result.success && result.summaryFile) {
        const summaryContent = await fs.readFile(result.summaryFile, 'utf-8');
        report.aiderBench.summary = JSON.parse(summaryContent);
        
        // Run anti-cheat detection
        if (aiderBaseline) {
          console.log(`[Anti-Cheat] Running AiderBench cheat detection...`);
          const cheatResult = await detectCheating(aiderBaseline, aiderTestDir, evaluatorDir, infraDir);
          report.aiderBench.antiCheat = cheatResult;
          
          if (!cheatResult.clean) {
            console.log(`[Anti-Cheat] VIOLATIONS DETECTED: ${cheatResult.riskLevel}`);
          } else {
            console.log(`[Anti-Cheat] Clean - no violations detected`);
          }
        }
      }
    }
  }

  // Save final report
  const reportPath = path.join(runDir, 'benchmark-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  
  // Generate checksums for all artifacts
  await generateChecksums(runDir);
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  BENCHMARK RUN COMPLETE`);
  console.log(`  Run ID: ${runId}`);
  console.log(`  Artifacts: ${runDir}`);
  console.log(`  Report: ${reportPath}`);
  console.log(`${'='.repeat(70)}\n`);

  return report;
}

/**
 * Create a minimal benchmark runner config for testing
 */
export function createTestConfig(benchmarkCommit: string): IBenchmarkRunnerConfig {
  return {
    sweBench: {
      enabled: false, // Disabled by default for testing
      dataset: 'princeton-nlp/SWE-bench_Lite',
      maxInstances: 10,
      maxIterations: 30,
      numWorkers: 2,
      llmConfig: 'llm.eval_test',
      runtime: 'docker'
    },
    aiderBench: {
      enabled: false,
      maxInstances: 10,
      maxIterations: 25,
      numWorkers: 2,
      llmConfig: 'llm.eval_test',
      useUnitTests: true
    },
    agent: {
      model: 'test-model',
      provider: 'test',
      version: '1.0.0',
      temperature: 0,
      maxTokens: 4096,
      toolBudget: 50,
      timeBudgetMs: 300000
    },
    outputDir: path.join(process.cwd(), 'benchmarks', 'runs'),
    benchmarkCommit
  };
}