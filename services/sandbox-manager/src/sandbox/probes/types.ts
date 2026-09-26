/**
 * Telemetry Probe Interfaces — @index0/sandbox-manager
 * Models hardware metrics, memory sanitizers, and property-based fuzz traces.
 */

export interface ISanitizerTrace {
  type: "data-race" | "lock-inversion" | "heap-buffer-overflow" | "use-after-free" | "uninitialized-read";
  memoryAddress?: string;
  threadsInvolved?: string[];
  stackTrace: string;
}

export interface IPerfMetrics {
  cycles?: number;
  instructions?: number;
  ipc?: number;
  l3CacheMissRatio?: number;
  branchMissRatio?: number;
  peakMemoryRssMb?: number;
  pageFaults?: number;
}

export interface IFuzzerResult {
  iterationsRun: number;
  passed: boolean;
  minimalCrashingInput?: string;
  failureTrace?: string;
  seed?: string;
}

export interface IProbeAnalysisResult {
  sanitizerFindings: ISanitizerTrace[];
  perfMetrics: IPerfMetrics;
  fuzzerResult?: IFuzzerResult;
  isSafe: boolean;
  score: number; // Normalized safety/performance score [0.0 - 1.0]
}
