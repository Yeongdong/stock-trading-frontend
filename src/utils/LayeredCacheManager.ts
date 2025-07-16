/**
 * 최적화된 계층적 캐시 매니저 (메모리 + localStorage)
 */
import {
  ICacheManager,
  CacheConfig,
  CacheHitResult,
  CacheStats,
  MemoryCacheEntry,
  StorageCacheEntry,
  CacheEvent,
  CacheEventType,
} from "@/types/domains/cache";

export class LayeredCacheManager<T> implements ICacheManager<T> {
  private readonly memoryCache = new Map<string, MemoryCacheEntry<T>>();
  private readonly eventListeners: Array<(event: CacheEvent<T>) => void> = [];
  private stats: CacheStats;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(private readonly config: CacheConfig) {
    this.stats = this.initializeStats();
    this.setupPeriodicCleanup();
  }

  // 공개 메서드
  get(key: string): CacheHitResult<T> {
    const normalizedKey = this.normalizeKey(key);

    // 메모리 캐시 확인
    const memoryResult = this.getFromMemory(normalizedKey);
    if (memoryResult.isHit) {
      this.updateMemoryAccess(normalizedKey);
      this.emitEvent("hit", normalizedKey, "memory", memoryResult.data);
      return memoryResult;
    }

    // 메모리에서 미스 - 메모리 미스 카운트 증가
    this.stats.memory.missCount++;

    // localStorage 확인 및 메모리로 승격
    const storageResult = this.getFromStorage(normalizedKey);
    if (storageResult.isHit) {
      this.promoteToMemory(normalizedKey, storageResult.data!);
      this.emitEvent("hit", normalizedKey, "storage", storageResult.data);
      return storageResult;
    }

    // 스토리지에서도 미스 - 스토리지 미스 카운트 증가
    this.stats.storage.missCount++;
    this.emitEvent("miss", normalizedKey, "memory");
    return { isHit: false, source: "miss" };
  }

  set(key: string, data: T): void {
    const normalizedKey = this.normalizeKey(key);

    // 동시에 메모리와 스토리지에 저장
    this.setToMemory(normalizedKey, data);
    this.setToStorage(normalizedKey, data);
    this.emitEvent("set", normalizedKey, "memory", data);
  }

  delete(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);
    const memoryDeleted = this.memoryCache.delete(normalizedKey);
    const storageDeleted = this.deleteFromStorage(normalizedKey);

    if (memoryDeleted || storageDeleted) {
      this.updateMemorySize();
      this.emitEvent("delete", normalizedKey, "memory");
      return true;
    }
    return false;
  }

  clear(): void {
    this.memoryCache.clear();
    this.clearStorage();
    this.stats = this.initializeStats();
    this.emitEvent("clear", "", "memory");
  }

  cleanup(): void {
    this.cleanupExpiredMemoryEntries();
    this.cleanupStorage();
  }

  getStats(): CacheStats {
    return {
      ...this.stats,
      overall: {
        totalHits: this.stats.memory.hitCount + this.stats.storage.hitCount,
        totalMisses: this.stats.memory.missCount + this.stats.storage.missCount,
        hitRate: this.calculateHitRate(),
      },
    };
  }

  getConfig(): CacheConfig {
    return { ...this.config };
  }

  addEventListener(listener: (event: CacheEvent<T>) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: CacheEvent<T>) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) this.eventListeners.splice(index, 1);
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.eventListeners.length = 0;
    this.memoryCache.clear();
    this.updateMemorySize();
  }

  // 메모리 캐시 관리
  private getFromMemory(key: string): CacheHitResult<T> {
    const entry = this.memoryCache.get(key);
    if (!entry) return { isHit: false, source: "miss" };

    if (this.isExpired(entry.expiryTime)) {
      this.memoryCache.delete(key);
      this.stats.memory.evictionCount++;
      this.updateMemorySize();
      return { isHit: false, source: "miss" };
    }

    this.stats.memory.hitCount++;
    return {
      isHit: true,
      source: "memory",
      data: entry.data,
      metadata: {
        cachedAt: entry.timestamp,
        expiresAt: entry.expiryTime,
        accessCount: entry.accessCount,
      },
    };
  }

  private setToMemory(key: string, data: T): void {
    if (this.memoryCache.size >= this.config.memoryMaxSize)
      this.evictLRUFromMemory();

    this.memoryCache.set(key, this.createMemoryEntry(data));
    this.updateMemorySize();
  }

  private promoteToMemory(key: string, data: T): void {
    // storage에서 메모리로 승격 시에는 크기 제한 무시
    this.memoryCache.set(key, this.createMemoryEntry(data));
    this.updateMemorySize();
  }

  private updateMemoryAccess(key: string): void {
    const entry = this.memoryCache.get(key);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
    }
  }

  private evictLRUFromMemory(): void {
    const oldestEntry = this.findLRUEntry();
    if (oldestEntry) {
      this.memoryCache.delete(oldestEntry.key);
      this.stats.memory.evictionCount++;
      this.emitEvent("evict", oldestEntry.key, "memory");
    }
  }

  private findLRUEntry(): { key: string; lastAccessed: number } | null {
    let oldestKey = "";
    let oldestTime = Date.now();

    const entries = Array.from(this.memoryCache.entries());
    for (const [key, entry] of entries) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey ? { key: oldestKey, lastAccessed: oldestTime } : null;
  }

  private cleanupExpiredMemoryEntries(): void {
    const now = Date.now();
    let evictedCount = 0;

    const entries = Array.from(this.memoryCache.entries());
    for (const [key, entry] of entries) {
      if (this.isExpired(entry.expiryTime, now)) {
        this.memoryCache.delete(key);
        evictedCount++;
      }
    }

    this.stats.memory.evictionCount += evictedCount;
    this.updateMemorySize();
  }

  // localStorage 관리
  private getFromStorage(key: string): CacheHitResult<T> {
    if (!this.isStorageAvailable()) return { isHit: false, source: "miss" };

    const storageKey = this.getStorageKey(key);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return { isHit: false, source: "miss" };

    const entry: StorageCacheEntry<T> = JSON.parse(stored);

    // 버전 및 만료 검사
    if (
      entry.version !== this.config.version ||
      this.isExpired(entry.expiryTime)
    ) {
      localStorage.removeItem(storageKey);
      this.stats.storage.evictionCount++;
      return { isHit: false, source: "miss" };
    }

    this.stats.storage.hitCount++;
    return {
      isHit: true,
      source: "storage",
      data: entry.data,
      metadata: {
        cachedAt: entry.timestamp,
        expiresAt: entry.expiryTime,
      },
    };
  }

  private setToStorage(key: string, data: T): void {
    if (!this.isStorageAvailable()) return;

    this.manageStorageSize();
    const storageKey = this.getStorageKey(key);
    const entry: StorageCacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiryTime: Date.now() + this.config.ttl,
      version: this.config.version,
    };

    localStorage.setItem(storageKey, JSON.stringify(entry));
    this.updateStorageSize();
  }

  private deleteFromStorage(key: string): boolean {
    if (!this.isStorageAvailable()) return false;

    const storageKey = this.getStorageKey(key);
    const existed = localStorage.getItem(storageKey) !== null;
    localStorage.removeItem(storageKey);
    return existed;
  }

  private clearStorage(): void {
    if (!this.isStorageAvailable()) return;

    const keysToRemove = Object.keys(localStorage).filter((key) =>
      key.startsWith(this.config.storagePrefix)
    );
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  private cleanupStorage(): void {
    if (!this.isStorageAvailable()) return;

    const now = Date.now();
    const prefix = this.config.storagePrefix;
    let cleanedCount = 0;

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(prefix)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry: StorageCacheEntry<T> = JSON.parse(stored);
          if (
            this.isExpired(entry.expiryTime, now) ||
            entry.version !== this.config.version
          ) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      }
    }

    this.stats.storage.evictionCount += cleanedCount;
    this.updateStorageSize();
  }

  private manageStorageSize(): void {
    if (this.getStorageSize() >= this.config.storageMaxSize) {
      this.cleanupStorage();
    }
  }

  private normalizeKey(key: string): string {
    return key.toLowerCase().trim();
  }

  private isExpired(expiryTime: number, now = Date.now()): boolean {
    return now > expiryTime;
  }

  private createMemoryEntry(data: T): MemoryCacheEntry<T> {
    const now = Date.now();
    return {
      data,
      timestamp: now,
      expiryTime: now + this.config.ttl,
      accessCount: 1,
      lastAccessed: now,
    };
  }

  private getStorageKey(key: string): string {
    return `${this.config.storagePrefix}${key}`;
  }

  private getStorageSize(): number {
    if (!this.isStorageAvailable()) return 0;
    return Object.keys(localStorage).filter((key) =>
      key.startsWith(this.config.storagePrefix)
    ).length;
  }

  private updateMemorySize(): void {
    this.stats.memory.size = this.memoryCache.size;
  }

  private updateStorageSize(): void {
    this.stats.storage.size = this.getStorageSize();
  }

  private isStorageAvailable(): boolean {
    try {
      const testKey = "__cache_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private initializeStats(): CacheStats {
    return {
      memory: {
        size: 0,
        maxSize: this.config.memoryMaxSize,
        hitCount: 0,
        missCount: 0,
        evictionCount: 0,
      },
      storage: {
        size: this.getStorageSize(),
        maxSize: this.config.storageMaxSize,
        hitCount: 0,
        missCount: 0,
        evictionCount: 0,
      },
      overall: {
        totalHits: 0,
        totalMisses: 0,
        hitRate: 0,
      },
    };
  }

  private calculateHitRate(): number {
    const totalRequests =
      this.stats.memory.hitCount + this.stats.memory.missCount;
    return totalRequests > 0
      ? (this.stats.memory.hitCount / totalRequests) * 100
      : 0;
  }

  private setupPeriodicCleanup(): void {
    this.cleanupTimer = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private emitEvent(
    type: CacheEventType,
    key: string,
    source: "memory" | "storage",
    data?: T
  ): void {
    if (this.eventListeners.length === 0) return; // 성능 최적화

    const event: CacheEvent<T> = {
      type,
      key,
      source,
      data,
      timestamp: Date.now(),
    };

    this.eventListeners.forEach((listener) => listener(event));
  }
}
