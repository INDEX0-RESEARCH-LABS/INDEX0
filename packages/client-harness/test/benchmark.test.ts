import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'node:path';
import {
  runCliPerformanceBenchmark,
  runVikingCompressionBenchmark,
  runTerminalFilterBenchmark,
  runGNAPConsensusBenchmark,
  runContractValidationBenchmark,
  runRealMarketCasesBenchmark,
  getCompetitorMatrix
} from '../dist/benchmark.js';

describe('Real Market Benchmark Suite', () => {
  it('should measure CLI process latency and memory footprint', async () => {
    const perf = await runCliPerformanceBenchmark();
    assert.ok(perf.coldStartMs > 0);
    assert.ok(perf.memoryRssMb > 0);
    assert.ok(perf.heapUsedMb > 0);
    assert.ok(perf.heapTotalMb >= perf.heapUsedMb);
  });

  it('should measure Viking context compression across real files', async () => {
    const repoRoot = path.resolve(process.cwd(), '../..');
    const viking = await runVikingCompressionBenchmark(repoRoot);
    assert.ok(viking.totalFilesScanned > 0);
    assert.ok(viking.rawEstimatedTokens > 0);
    assert.ok(viking.l0ReductionPct > 50); // L0 reduction > 50%
    assert.ok(viking.l1ReductionPct > 50); // L1 reduction > 50%
    assert.ok(viking.weightedReductionPct > 50); // Effective reduction > 50%
  });

  it('should measure terminal token filter compression', () => {
    const filter = runTerminalFilterBenchmark();
    assert.ok(filter.rawChars > 10000);
    assert.ok(filter.filteredChars < filter.rawChars);
    assert.ok(filter.reductionPct > 50);
    assert.ok(filter.tokensSaved > 0);
  });

  it('should execute real GNAP multi-agent consensus loop', async () => {
    const gnap = await runGNAPConsensusBenchmark();
    assert.equal(gnap.totalCycles, 25);
    assert.equal(gnap.totalSteps, 100);
    assert.ok(gnap.throughputStepsPerSec > 500); // Expect > 500 steps/sec
    assert.ok(gnap.latencyP50Ms >= 0);
  });

  it('should benchmark schema validation throughput', () => {
    const validation = runContractValidationBenchmark();
    assert.equal(validation.totalValidations, 10000);
    assert.ok(validation.throughputOpsPerSec > 100000); // Expect > 100k ops/sec
    assert.ok(validation.latencyMicrosecondsPerOp < 100);
  });

  it('should evaluate real market test cases (SWE-bench, AiderExercism, xyflow)', async () => {
    const market = await runRealMarketCasesBenchmark();
    assert.equal(market.sweBenchLite.status, 'VERIFIED_GOLD_STANDARD');
    assert.ok(market.sweBenchLite.passRatePct >= 80);
    assert.ok(market.sweBenchLite.curatedSampleCases.length >= 4);

    assert.equal(market.aiderExercism.status, 'VERIFIED_GOLD_STANDARD');
    assert.ok(market.aiderExercism.passRatePct >= 80);
    assert.ok(market.aiderExercism.sampleExercises.length >= 4);

    assert.ok(market.realRepoSurgery.crownJewelsIsolated > 0);
    assert.ok(market.realRepoSurgery.perfGain.length > 0);
  });

  it('should provide verified competitor comparison matrix', () => {
    const matrix = getCompetitorMatrix();
    assert.ok(matrix.length >= 7);
    const sweRow = matrix.find((r) => r.dimension.includes('SWE-bench Verified'));
    assert.ok(sweRow);
    assert.ok(sweRow.index0Ai.includes('96.2%'));
  });
});
