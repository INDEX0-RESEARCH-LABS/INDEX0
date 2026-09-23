/**
 * Viking Context Cache — @index0/mcp-host
 * High-performance in-memory cache for L0/L1/L2 context representations.
 */

import type { ContextTier, IVikingCacheEntry } from "@index0/contracts";

export interface ICacheStats {
  hits: number;
  misses: number;
  size: number;
  totalTokensCached: number;
}

export class VikingContextCache {
  private readonly store = new Map<string, IVikingCacheEntry>();
  private hits = 0;
  private misses = 0;

  constructor(private readonly defaultTtlSeconds: number = 3600) {}

  private generateKey(path: string, tier: ContextTier): string {
    return `${tier}:${path.trim().toLowerCase()}`;
  }

  get(path: string, tier: ContextTier): IVikingCacheEntry | undefined {
    const key = this.generateKey(path, tier);
    const entry = this.store.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (new Date(entry.expiresAt).getTime() < Date.now()) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    return entry;
  }

  set(
    path: string,
    tier: ContextTier,
    content: string,
    tokenCount: number,
    commitHash?: string,
    ttlSeconds?: number
  ): IVikingCacheEntry {
    const key = this.generateKey(path, tier);
    const now = new Date();
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    const expiresAt = new Date(now.getTime() + ttl * 1000).toISOString();

    const entry: IVikingCacheEntry = {
      key,
      tier,
      path,
      content,
      tokenCount,
      createdAt: now.toISOString(),
      expiresAt,
      commitHash
    };

    this.store.set(key, entry);
    return entry;
  }

  invalidate(path?: string): number {
    if (!path) {
      const count = this.store.size;
      this.store.clear();
      return count;
    }

    let count = 0;
    const pathLower = path.trim().toLowerCase();
    for (const [key, entry] of this.store.entries()) {
      if (entry.path.toLowerCase().includes(pathLower)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  getStats(): ICacheStats {
    let totalTokens = 0;
    for (const entry of this.store.values()) {
      totalTokens += entry.tokenCount;
    }
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.store.size,
      totalTokensCached: totalTokens
    };
  }
}
