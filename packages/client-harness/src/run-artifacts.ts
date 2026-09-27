/**
 * Task Manifest Freezing & Run Artifact Generation
 * 
 * Implements the no-cherry-picking requirement: freeze task list, hash manifest,
 * record evaluation criteria BEFORE execution. Generate complete per-run artifacts.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as os from 'node:os';

export interface ITaskManifest {
  version: string;
  createdAt: string;
  benchmarkCommit: string;
  dataset: {
    name: string;
    version: string;
    source: string;
    taskIds: string[];
  };
  evaluationCriteria: {
    successLevels: string[];
    primaryMetric: string;
    antiCheatChecks: string[];
  };
  environment: {
    platform: string;
    arch: string;
    nodeVersion: string;
    runtime: string;
  };
  hash: string;
}

export interface IRunMetadata {
  runId: string;
  taskId: string;
  startedAt: string;
  completedAt?: string;
  agentConfig: {
    model: string;
    provider: string;
    version: string;
    temperature: number;
    maxTokens: number;
    toolBudget: number;
    timeBudgetMs: number;
  };
  environment: {
    platform: string;
    arch: string;
    cpus: number;
    totalMemoryGb: number;
    networkPolicy: string;
    sandboxConfig: string;
  };
  repository: {
    url: string;
    commit: string;
    worktreePath?: string;
  };
  task: {
    id: string;
    description: string;
    difficulty: 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
    filesEstimated: number;
  };
  checksums: {
    manifest: string;
    config: string;
  };
}

export interface ITranscriptEntry {
  timestamp: string;
  type: 'prompt' | 'tool_call' | 'tool_result' | 'observation' | 'error' | 'agent_thought';
  content: any;
  tokens?: {
    input: number;
    output: number;
  };
  latencyMs?: number;
}

export interface IToolCall {
  timestamp: string;
  tool: string;
  args: any;
  result?: any;
  error?: string;
  durationMs: number;
  filesModified?: string[];
}

export interface IResourceUsage {
  timestamp: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  costUsd: number;
  wallClockMs: number;
  cpuTimeMs: number;
  memoryMb: number;
}

export interface ITestResult {
  timestamp: string;
  suite: string;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  testsSkipped: number;
  output: string;
  regressions?: string[];
}

export interface IEvaluationResult {
  timestamp: string;
  taskId: string;
  successLevel: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'NONE';
  criteria: {
    patchApplies: boolean;
    existingTestsPass: boolean;
    hiddenTestsPass: boolean;
    regressionTestsPass: boolean;
    behavioralRequirementsPass: boolean;
    noKnownRegression: boolean;
  };
  antiCheat: {
    testsModified: boolean;
    testsDeleted: boolean;
    assertionsWeakened: boolean;
    evaluatorModified: boolean;
    benchmarkModified: boolean;
    networkAccess: boolean;
    hardcodedOutputs: boolean;
  };
  score: number;
  notes: string[];
}

export interface IFinalState {
  timestamp: string;
  repositoryState: 'clean' | 'modified' | 'worktree';
  filesModified: string[];
  linesAdded: number;
  linesRemoved: number;
  patchDiff?: string;
  worktreePath?: string;
  gitStatus: string;
}

/**
 * Generate a frozen task manifest with cryptographic hash
 */
export async function createTaskManifest(
  datasetName: string,
  datasetVersion: string,
  datasetSource: string,
  taskIds: string[],
  evaluationCriteria: ITaskManifest['evaluationCriteria'],
  benchmarkCommit: string
): Promise<ITaskManifest> {
  const manifest: Omit<ITaskManifest, 'hash'> = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    benchmarkCommit,
    dataset: {
      name: datasetName,
      version: datasetVersion,
      source: datasetSource,
      taskIds
    },
    evaluationCriteria,
    environment: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      runtime: 'node'
    }
  };

  const manifestString = JSON.stringify(manifest, null, 2);
  const hash = crypto.createHash('sha256').update(manifestString).digest('hex');

  return { ...manifest, hash };
}

/**
 * Save task manifest to disk
 */
export async function saveTaskManifest(manifest: ITaskManifest, outputDir: string): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const manifestPath = path.join(outputDir, `task-manifest-${manifest.hash.slice(0, 12)}.json`);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  return manifestPath;
}

/**
 * Create run metadata with all configuration
 */
export function createRunMetadata(
  runId: string,
  taskId: string,
  agentConfig: IRunMetadata['agentConfig'],
  repository: IRunMetadata['repository'],
  task: IRunMetadata['task'],
  manifestHash: string,
  configHash: string
): IRunMetadata {
  return {
    runId,
    taskId,
    startedAt: new Date().toISOString(),
    agentConfig,
    environment: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemoryGb: Math.round(os.totalmem() / (1024 * 1024 * 1024) * 10) / 10,
      networkPolicy: 'restricted',
      sandboxConfig: 'firecracker-microvm'
    },
    repository,
    task,
    checksums: {
      manifest: manifestHash,
      config: configHash
    }
  };
}

/**
 * Save run metadata
 */
export async function saveRunMetadata(metadata: IRunMetadata, outputDir: string): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const metadataPath = path.join(outputDir, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  return metadataPath;
}

/**
 * Append to transcript log (JSONL)
 */
export async function appendTranscript(entry: ITranscriptEntry, runDir: string): Promise<void> {
  const transcriptPath = path.join(runDir, 'transcript.jsonl');
  await fs.appendFile(transcriptPath, JSON.stringify(entry) + '\n', 'utf-8');
}

/**
 * Append to tool calls log (JSONL)
 */
export async function appendToolCall(call: IToolCall, runDir: string): Promise<void> {
  const toolCallsPath = path.join(runDir, 'tool_calls.jsonl');
  await fs.appendFile(toolCallsPath, JSON.stringify(call) + '\n', 'utf-8');
}

/**
 * Save stdout/stderr logs
 */
export async function saveStdout(content: string, runDir: string): Promise<void> {
  const stdoutPath = path.join(runDir, 'stdout.log');
  await fs.appendFile(stdoutPath, content + '\n', 'utf-8');
}

export async function saveStderr(content: string, runDir: string): Promise<void> {
  const stderrPath = path.join(runDir, 'stderr.log');
  await fs.appendFile(stderrPath, content + '\n', 'utf-8');
}

/**
 * Save patch diff
 */
export async function savePatch(diff: string, runDir: string): Promise<string> {
  const patchPath = path.join(runDir, 'patch.diff');
  await fs.writeFile(patchPath, diff, 'utf-8');
  return patchPath;
}

/**
 * Save test results
 */
export async function saveTestResults(results: ITestResult, runDir: string): Promise<void> {
  const testPath = path.join(runDir, 'tests.log');
  const entry = JSON.stringify(results) + '\n';
  await fs.appendFile(testPath, entry, 'utf-8');
}

/**
 * Save evaluation result
 */
export async function saveEvaluation(evaluation: IEvaluationResult, runDir: string): Promise<string> {
  const evalPath = path.join(runDir, 'evaluation.json');
  await fs.writeFile(evalPath, JSON.stringify(evaluation, null, 2), 'utf-8');
  return evalPath;
}

/**
 * Save resource usage
 */
export async function saveResourceUsage(usage: IResourceUsage, runDir: string): Promise<void> {
  const usagePath = path.join(runDir, 'resource_usage.json');
  await fs.appendFile(usagePath, JSON.stringify(usage) + '\n', 'utf-8');
}

/**
 * Save final state
 */
export async function saveFinalState(state: IFinalState, runDir: string): Promise<string> {
  const statePath = path.join(runDir, 'final_state.json');
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');
  return statePath;
}

/**
 * Generate checksums for all artifacts in run directory
 */
export async function generateChecksums(runDir: string): Promise<string> {
  const files = await fs.readdir(runDir);
  const checksums: Record<string, string> = {};

  for (const file of files) {
    const filePath = path.join(runDir, file);
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      const content = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      checksums[file] = hash;
    }
  }

  const checksumsPath = path.join(runDir, 'checksums.sha256');
  await fs.writeFile(checksumsPath, JSON.stringify(checksums, null, 2), 'utf-8');
  return checksumsPath;
}

/**
 * Create complete run directory structure
 */
export async function createRunDirectory(baseDir: string, runId: string): Promise<string> {
  const runDir = path.join(baseDir, 'runs', runId);
  await fs.mkdir(runDir, { recursive: true });
  return runDir;
}

/**
 * Human intervention classification
 */
export type InterventionLevel = 0 | 1 | 2 | 3 | 4;

export const INTERVENTION_LABELS: Record<InterventionLevel, string> = {
  0: 'completely_autonomous',
  1: 'clarification_only',
  2: 'human_approval_required',
  3: 'human_debugging_required',
  4: 'human_implementation_required'
};

/**
 * Record human intervention
 */
export interface IInterventionRecord {
  timestamp: string;
  level: InterventionLevel;
  reason: string;
  actionTaken: string;
  impactOnTask: 'none' | 'minor' | 'major' | 'decisive';
}

export async function recordIntervention(record: IInterventionRecord, runDir: string): Promise<void> {
  const interventionPath = path.join(runDir, 'interventions.jsonl');
  await fs.appendFile(interventionPath, JSON.stringify(record) + '\n', 'utf-8');
}