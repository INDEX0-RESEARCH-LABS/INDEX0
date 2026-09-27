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
  getQuarantinedClaims
} from '../dist/benchmark.js';

describe('Benchmark Suite — Mechanics Verification', () => {
  it('should measure CLI process latency and memory footprint', async () => {
    const perf = await runCliPerformanceBenchmark();
    assert.ok(perf.coldStartMs > 0);
    assert.ok(perf.memoryRssMb > 0);
    assert.ok(perf.heapUsedMb > 0);
    assert.ok(perf.heapTotalMb >= perf.heapUsedMb);
    assert.ok(perf.measurementNote && perf.measurementNote.length > 0);
  });

  it('should measure Viking context compression across real files', async () => {
    const repoRoot = path.resolve(process.cwd(), '../..');
    const viking = await runVikingCompressionBenchmark(repoRoot);
    assert.ok(viking.totalFilesScanned > 0);
    assert.ok(viking.rawEstimatedTokens > 0);
    assert.ok(viking.l0ReductionPct > 0);
    assert.ok(viking.l1ReductionPct > 0);
    assert.ok(viking.weightedReductionPct > 0);
    assert.ok(viking.measurementNote && viking.measurementNote.length > 0);
    // Verify it's marked as estimate, not outcome
    assert.ok(viking.measurementNote.includes('ESTIMATE') || viking.measurementNote.includes('estimate'));
  });

  it('should measure terminal token filter compression', () => {
    const filter = runTerminalFilterBenchmark();
    assert.ok(filter.rawChars > 10000);
    assert.ok(filter.filteredChars < filter.rawChars);
    assert.ok(filter.reductionPct > 0);
    assert.ok(filter.tokensSaved > 0);
    assert.ok(filter.measurementNote && filter.measurementNote.length > 0);
  });

  it('should execute real GNAP multi-agent consensus loop', async () => {
    const gnap = await runGNAPConsensusBenchmark();
    assert.equal(gnap.totalCycles, 25);
    assert.equal(gnap.totalSteps, 100);
    assert.ok(gnap.throughputStepsPerSec > 0);
    assert.ok(gnap.latencyP50Ms >= 0);
    assert.ok(gnap.measurementNote && gnap.measurementNote.length > 0);
  });

  it('should benchmark schema validation throughput', () => {
    const validation = runContractValidationBenchmark();
    assert.equal(validation.totalValidations, 10000);
    assert.ok(validation.throughputOpsPerSec > 0);
    assert.ok(validation.latencyMicrosecondsPerOp > 0);
    assert.ok(validation.measurementNote && validation.measurementNote.length > 0);
  });

  it('should execute smoke checks (not official benchmarks)', async () => {
    const market = await runRealMarketCasesBenchmark();
    // Smoke checks should be marked as such, not VERIFIED_GOLD_STANDARD
    assert.equal(market.sweBenchLite.status, 'SMOKE_CHECK_ONLY');
    assert.ok(market.sweBenchLite.measurementNote && market.sweBenchLite.measurementNote.includes('SMOKE CHECK'));
    
    assert.equal(market.aiderExercism.status, 'SMOKE_CHECK_ONLY');
    assert.ok(market.aiderExercism.measurementNote && market.aiderExercism.measurementNote.includes('SMOKE CHECK'));
    
    assert.ok(market.realRepoSurgery.measurementNote && market.realRepoSurgery.measurementNote.includes('UNVERIFIED'));
  });

  it('should list quarantined claims', () => {
    const claims = getQuarantinedClaims();
    assert.ok(claims.length > 0);
    assert.ok(claims.some(c => c.includes('SWE-bench')));
    assert.ok(claims.some(c => c.includes('AiderBench')));
    assert.ok(claims.some(c => c.includes('Viking')));
  });

  it('should produce report with integrity firewall', async () => {
    const { executeFullBenchmarkSuite } = await import('../dist/benchmark.js');
    const report = await executeFullBenchmarkSuite({ json: true });
    assert.ok(report.integrity.claimFirewallActive === true);
    assert.ok(report.integrity.unverifiedClaimsQuarantined.length > 0);
    assert.ok(report.integrity.blockedFromPublication.length > 0);
  });
});
