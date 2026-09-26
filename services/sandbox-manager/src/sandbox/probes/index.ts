/**
 * Probe Manager Module — @index0/sandbox-manager
 * Combines hardware telemetry, memory safety sanitizers, and property fuzzers.
 */

import { SanitizerAnalyzer } from "./sanitizer.js";
import { ProfilerAnalyzer } from "./profiler.js";
import { FuzzerAnalyzer } from "./fuzzer.js";
import type { IProbeAnalysisResult } from "./types.js";

export * from "./types.js";
export * from "./sanitizer.js";
export * from "./profiler.js";
export * from "./fuzzer.js";

export class ProbeManager {
  /**
   * Evaluates complete terminal output across all empirical probes.
   */
  public static evaluate(output: string, exitCode: number): IProbeAnalysisResult {
    const sanitizerFindings = SanitizerAnalyzer.parse(output);
    const perfMetrics = ProfilerAnalyzer.parse(output);
    const fuzzerResult = FuzzerAnalyzer.parse(output);

    const hasDataRace = sanitizerFindings.some((t) => t.type === "data-race" || t.type === "lock-inversion");
    const hasCrash = exitCode !== 0 || !fuzzerResult.passed;
    const isSafe = !hasDataRace && !hasCrash;

    // Calculate normalized composite score [0.0 - 1.0]
    let score = isSafe ? 1.0 : 0.0;
    if (perfMetrics.l3CacheMissRatio !== undefined) {
      // Lower cache miss ratio is better
      const cacheScore = Math.max(0, 1.0 - perfMetrics.l3CacheMissRatio * 2.0);
      score = score * 0.7 + cacheScore * 0.3;
    }

    return {
      sanitizerFindings,
      perfMetrics,
      fuzzerResult,
      isSafe,
      score: parseFloat(score.toFixed(3))
    };
  }
}
