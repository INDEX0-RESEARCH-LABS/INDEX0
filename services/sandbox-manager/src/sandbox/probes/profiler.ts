/**
 * Hardware Telemetry Profiler Probe — @index0/sandbox-manager
 * Extracts CPU cycles, IPC, and L1/L3 cache miss metrics from Linux perf.
 */

import type { IPerfMetrics } from "./types.js";

export class ProfilerAnalyzer {
  /**
   * Parses standard Linux `perf stat` terminal output into structured metrics.
   */
  public static parse(output: string): IPerfMetrics {
    const metrics: IPerfMetrics = {};

    // 1. Cycles
    const cyclesMatch = output.match(/([\d,]+)\s+cycles/);
    if (cyclesMatch) {
      metrics.cycles = parseInt(cyclesMatch[1].replace(/,/g, ""), 10);
    }

    // 2. Instructions & IPC
    const instMatch = output.match(/([\d,]+)\s+instructions/);
    if (instMatch) {
      metrics.instructions = parseInt(instMatch[1].replace(/,/g, ""), 10);
      const ipcMatch = output.match(/#\s+([\d\.]+)\s+insn per cycle/);
      if (ipcMatch) {
        metrics.ipc = parseFloat(ipcMatch[1]);
      } else if (metrics.cycles && metrics.cycles > 0) {
        metrics.ipc = parseFloat((metrics.instructions / metrics.cycles).toFixed(2));
      }
    }

    // 3. Cache Misses & Ratio
    const missMatch = output.match(/([\d,]+)\s+cache-misses/);
    const refMatch = output.match(/([\d,]+)\s+cache-references/);
    if (missMatch && refMatch) {
      const misses = parseInt(missMatch[1].replace(/,/g, ""), 10);
      const refs = parseInt(refMatch[1].replace(/,/g, ""), 10);
      if (refs > 0) {
        metrics.l3CacheMissRatio = parseFloat((misses / refs).toFixed(4));
      }
    } else {
      // Direct percentage match from perf
      const ratioMatch = output.match(/([\d\.]+)%\s+of all L1-dcache accesses/);
      if (ratioMatch) {
        metrics.l3CacheMissRatio = parseFloat((parseFloat(ratioMatch[1]) / 100.0).toFixed(4));
      }
    }

    // 4. Branch Misses
    const branchMissMatch = output.match(/([\d\.]+)%\s+of all branches/);
    if (branchMissMatch) {
      metrics.branchMissRatio = parseFloat((parseFloat(branchMissMatch[1]) / 100.0).toFixed(4));
    }

    return metrics;
  }
}
