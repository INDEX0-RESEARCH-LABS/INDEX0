/**
 * Sanitizer Probe Analyzer — @index0/sandbox-manager
 * Extracts deterministic race conditions and memory safety violations from TSAN / ASAN logs.
 */

import type { ISanitizerTrace } from "./types.js";

export class SanitizerAnalyzer {
  /**
   * Analyzes stderr and stdout for memory and concurrency sanitizer traces.
   */
  public static parse(output: string): ISanitizerTrace[] {
    const traces: ISanitizerTrace[] = [];

    // 1. ThreadSanitizer Data Race detection (C/C++/Rust/Go)
    if (output.includes("WARNING: ThreadSanitizer: data race") || output.includes("WARNING: DATA RACE")) {
      const matchAddr = output.match(/(?:at|address)\s+(0x[0-9a-fA-F]+)/i);
      const threads: string[] = [];
      const threadMatches = output.matchAll(/(?:thread|goroutine)\s+([a-zA-Z0-9_]+)/gi);
      for (const m of threadMatches) {
        if (!threads.includes(m[1])) threads.push(m[1]);
      }

      traces.push({
        type: "data-race",
        memoryAddress: matchAddr ? matchAddr[1] : undefined,
        threadsInvolved: threads.length > 0 ? threads : undefined,
        stackTrace: this.extractSnippet(output, "data race", 15)
      });
    }

    // 2. Lock Inversion / Deadlock detection
    if (output.includes("lock-order-inversion") || output.includes("Cycle in lock order graph")) {
      traces.push({
        type: "lock-inversion",
        stackTrace: this.extractSnippet(output, "lock order", 12)
      });
    }

    // 3. AddressSanitizer Buffer Overflow / Use-After-Free
    if (output.includes("AddressSanitizer: heap-buffer-overflow")) {
      traces.push({
        type: "heap-buffer-overflow",
        stackTrace: this.extractSnippet(output, "heap-buffer-overflow", 10)
      });
    } else if (output.includes("AddressSanitizer: heap-use-after-free")) {
      traces.push({
        type: "use-after-free",
        stackTrace: this.extractSnippet(output, "heap-use-after-free", 10)
      });
    }

    return traces;
  }

  private static extractSnippet(text: string, anchor: string, linesCount: number): string {
    const lines = text.split("\n");
    const idx = lines.findIndex((l) => l.toLowerCase().includes(anchor.toLowerCase()));
    if (idx === -1) return text.slice(0, 500);

    const start = Math.max(0, idx - 2);
    const end = Math.min(lines.length, idx + linesCount);
    return lines.slice(start, end).join("\n");
  }
}
