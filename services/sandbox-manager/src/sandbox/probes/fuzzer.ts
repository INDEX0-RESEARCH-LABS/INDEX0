/**
 * Property Fuzzer Probe Analyzer — @index0/sandbox-manager
 * Extracts minimal counterexamples and failing input invariants from property-based tests.
 */

import type { IFuzzerResult } from "./types.js";

export class FuzzerAnalyzer {
  /**
   * Parses test runner logs for property-based fuzzer failure traces (Hypothesis / fast-check).
   */
  public static parse(output: string): IFuzzerResult {
    // 1. Python Hypothesis pattern: "Falsifying example: run(...)"
    const hypothesisMatch = output.match(/Falsifying example:\s*([^\n]+)/);
    if (hypothesisMatch) {
      return {
        iterationsRun: 100,
        passed: false,
        minimalCrashingInput: hypothesisMatch[1].trim(),
        failureTrace: output.slice(output.indexOf("Falsifying example:"), output.indexOf("Falsifying example:") + 400)
      };
    }

    // 2. TypeScript fast-check pattern: "Property failed after X tests ... Counterexample: [...]"
    const fastCheckMatch = output.match(/Counterexample:\s*([^\n]+)/);
    if (fastCheckMatch) {
      const testsMatch = output.match(/failed after (\d+) tests/);
      return {
        iterationsRun: testsMatch ? parseInt(testsMatch[1], 10) : 50,
        passed: false,
        minimalCrashingInput: fastCheckMatch[1].trim(),
        failureTrace: output.slice(output.indexOf("Counterexample:"), output.indexOf("Counterexample:") + 400)
      };
    }

    // Passed fuzzer runs
    const passedMatch = output.match(/(\d+)\s+property tests passed/i);
    return {
      iterationsRun: passedMatch ? parseInt(passedMatch[1], 10) : 100,
      passed: !output.includes("FAILED") && !output.includes("Error:"),
      minimalCrashingInput: undefined
    };
  }
}
