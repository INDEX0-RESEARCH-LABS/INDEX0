/**
 * Unit Tests for Sandbox Telemetry Probes — @index0/sandbox-manager
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SanitizerAnalyzer } from "../dist/sandbox/probes/sanitizer.js";
import { ProfilerAnalyzer } from "../dist/sandbox/probes/profiler.js";
import { FuzzerAnalyzer } from "../dist/sandbox/probes/fuzzer.js";
import { ProbeManager } from "../dist/sandbox/probes/index.js";

describe("Empirical Telemetry Probes", () => {
  it("should detect ThreadSanitizer data race and extract address and threads", () => {
    const tsanLog = `
==================
WARNING: ThreadSanitizer: data race (pid=4102)
  Write of size 8 at 0x7fff5fbff880 by thread T1:
    #0 workerPool.dispatch worker.go:42 (worker+0x1000)
  Previous read of size 8 at 0x7fff5fbff880 by thread T2:
    #0 workerPool.drain worker.go:88 (worker+0x1020)
==================
`;
    const traces = SanitizerAnalyzer.parse(tsanLog);
    assert.strictEqual(traces.length, 1);
    assert.strictEqual(traces[0].type, "data-race");
    assert.strictEqual(traces[0].memoryAddress, "0x7fff5fbff880");
    assert.ok(traces[0].threadsInvolved?.includes("T1"));
    assert.ok(traces[0].threadsInvolved?.includes("T2"));
  });

  it("should parse Linux perf stat metrics including IPC and L3 cache miss ratio", () => {
    const perfLog = `
 Performance counter stats for './benchmark':

     1,240,500,120      cycles                    #    3.200 GHz
     2,481,000,240      instructions              #    2.00  insn per cycle
        12,500,000      cache-references
         1,250,000      cache-misses              #   10.00% of all L1-dcache accesses

       0.387654321 seconds time elapsed
`;
    const metrics = ProfilerAnalyzer.parse(perfLog);
    assert.strictEqual(metrics.cycles, 1240500120);
    assert.strictEqual(metrics.instructions, 2481000240);
    assert.strictEqual(metrics.ipc, 2.0);
    assert.strictEqual(metrics.l3CacheMissRatio, 0.1);
  });

  it("should extract minimal crashing input from property-based fuzzer failure", () => {
    const fuzzerLog = `
Error: Property failed after 42 tests
{ seed: 1827402, path: "4:0:1" }
Counterexample: [ { id: "tx_001", amount: -999999999 } ]
Shrunk 5 times
`;
    const result = FuzzerAnalyzer.parse(fuzzerLog);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.iterationsRun, 42);
    assert.ok(result.minimalCrashingInput?.includes("tx_001"));
  });

  it("should compute composite safety score through ProbeManager", () => {
    const cleanLog = `
100 property tests passed.
1,000,000 cycles
2,000,000 instructions
10,000 cache-references
500 cache-misses
`;
    const cleanEval = ProbeManager.evaluate(cleanLog, 0);
    assert.strictEqual(cleanEval.isSafe, true);
    assert.ok(cleanEval.score > 0.8);

    const raceLog = `WARNING: ThreadSanitizer: data race at 0x00123`;
    const raceEval = ProbeManager.evaluate(raceLog, 1);
    assert.strictEqual(raceEval.isSafe, false);
    assert.strictEqual(raceEval.score, 0);
  });
});
