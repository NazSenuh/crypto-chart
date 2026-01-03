import { LRUCache } from 'lru-cache';
import { CacheEntry } from '@/types';

const CACHE_TTL = 60 * 1000;
const MAX_CACHE_SIZE = 500; 

class ServerCache {
  private cache: LRUCache<string, CacheEntry<unknown>>;

  constructor() {
    this.cache = new LRUCache<string, CacheEntry<unknown>>({
      max: MAX_CACHE_SIZE,
      ttl: CACHE_TTL,
      updateAgeOnGet: true, 
    });
  }

  private generateKey(publicKey: string, action: string, params?: string): string {
    return `${publicKey}_${action}${params ? `_${params}` : ''}`;
  }

  get<T>(publicKey: string, action: string, params?: string): T | null {
    const key = this.generateKey(publicKey, action, params);
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(publicKey: string, action: string, data: T, params?: string): void {
    const key = this.generateKey(publicKey, action, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      publicKey,
    });
  }

  invalidate(publicKey: string, action?: string): void {
    if (action) {
      const prefix = `${publicKey}_${action}`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      for (const key of this.cache.keys()) {
        if (key.startsWith(publicKey)) {
          this.cache.delete(key);
        }
      }
    }
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

export const serverCache = new ServerCache();
