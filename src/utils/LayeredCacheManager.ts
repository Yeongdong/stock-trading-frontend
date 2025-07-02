/**
 * 계층적 캐시 매니저 (메모리 + localStorage)
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
  private memoryCache = new Map<string, MemoryCacheEntry<T>>();
  private stats: CacheStats;
  private eventListeners: Array<(event: CacheEvent<T>) => void> = [];

  constructor(private config: CacheConfig) {
    this.stats = this.initializeStats();
    this.setupPeriodicCleanup();
  }

  /**
   * 캐시에서 데이터 조회
   */
  get(key: string): CacheHitResult<T> {
    const normalizedKey = this.normalizeKey(key);

    // 메모리 캐시 확인
    const memoryResult = this.getFromMemory(normalizedKey);
    if (memoryResult.isHit) {
      this.updateMemoryAccess(normalizedKey);
      this.emitEvent("hit", normalizedKey, "memory", memoryResult.data);
      return memoryResult;
    }

    // localStorage 확인
    const storageResult = this.getFromStorage(normalizedKey);
    if (storageResult.isHit) {
      // 스토리지에서 찾은 데이터를 메모리에도 캐시
      this.setToMemory(normalizedKey, storageResult.data!);
      this.emitEvent("hit", normalizedKey, "storage", storageResult.data);
      return storageResult;
    }

    // 캐시 미스
    this.stats.memory.missCount++;
    this.stats.storage.missCount++;
    this.emitEvent("miss", normalizedKey, "memory");

    return { isHit: false, source: "miss" };
  }

  /**
   * 캐시에 데이터 저장
   */
  set(key: string, data: T): void {
    const normalizedKey = this.normalizeKey(key);

    // 메모리와 스토리지 둘 다 저장
    this.setToMemory(normalizedKey, data);
    this.setToStorage(normalizedKey, data);

    this.emitEvent("set", normalizedKey, "memory", data);
  }

  /**
   * 특정 키의 캐시 삭제
   */
  delete(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);

    const memoryDeleted = this.memoryCache.delete(normalizedKey);
    const storageDeleted = this.deleteFromStorage(normalizedKey);

    if (memoryDeleted || storageDeleted) {
      this.emitEvent("delete", normalizedKey, "memory");
      return true;
    }

    return false;
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    this.memoryCache.clear();
    this.clearStorage();
    this.stats = this.initializeStats();
    this.emitEvent("clear", "", "memory");
  }

  /**
   * 만료된 캐시 정리
   */
  cleanup(): void {
    const now = Date.now();
    let evictedCount = 0;

    // 메모리 캐시 정리
    const memoryEntries = Array.from(this.memoryCache.entries());
    for (const [key, entry] of memoryEntries) {
      if (now > entry.expiryTime) {
        this.memoryCache.delete(key);
        evictedCount++;
      }
    }

    // 스토리지 캐시 정리
    this.cleanupStorage();

    this.stats.memory.evictionCount += evictedCount;
  }

  /**
   * 캐시 통계 조회
   */
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

  /**
   * 캐시 설정 조회
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * 이벤트 리스너 등록
   */
  addEventListener(listener: (event: CacheEvent<T>) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * 이벤트 리스너 제거
   */
  removeEventListener(listener: (event: CacheEvent<T>) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // Private Methods

  private normalizeKey(key: string): string {
    return key.toLowerCase().trim();
  }

  private getFromMemory(key: string): CacheHitResult<T> {
    const entry = this.memoryCache.get(key);

    if (!entry) {
      return { isHit: false, source: "miss" };
    }

    if (Date.now() > entry.expiryTime) {
      this.memoryCache.delete(key);
      this.stats.memory.evictionCount++;
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
    // 메모리 크기 제한 확인
    if (this.memoryCache.size >= this.config.memoryMaxSize) {
      this.evictLRUFromMemory();
    }

    const entry: MemoryCacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiryTime: Date.now() + this.config.ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.memoryCache.set(key, entry);
    this.stats.memory.size = this.memoryCache.size;
  }

  private updateMemoryAccess(key: string): void {
    const entry = this.memoryCache.get(key);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
    }
  }

  private evictLRUFromMemory(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    const memoryEntries = Array.from(this.memoryCache.entries());
    for (const [key, entry] of memoryEntries) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.stats.memory.evictionCount++;
      this.emitEvent("evict", oldestKey, "memory");
    }
  }

  private getFromStorage(key: string): CacheHitResult<T> {
    if (!this.isStorageAvailable()) {
      return { isHit: false, source: "miss" };
    }

    const storageKey = this.getStorageKey(key);
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return { isHit: false, source: "miss" };
    }

    const entry: StorageCacheEntry<T> = JSON.parse(stored);

    // 버전 확인
    if (entry.version !== this.config.version) {
      localStorage.removeItem(storageKey);
      return { isHit: false, source: "miss" };
    }

    // 만료 확인
    if (Date.now() > entry.expiryTime) {
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
    if (!this.isStorageAvailable()) {
      return;
    }

    // 스토리지 크기 제한 확인
    this.manageStorageSize();

    const storageKey = this.getStorageKey(key);
    const entry: StorageCacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiryTime: Date.now() + this.config.ttl,
      version: this.config.version,
    };

    localStorage.setItem(storageKey, JSON.stringify(entry));
    this.updateStorageStats();
  }

  private deleteFromStorage(key: string): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }

    const storageKey = this.getStorageKey(key);
    const existed = localStorage.getItem(storageKey) !== null;
    localStorage.removeItem(storageKey);
    return existed;
  }

  private clearStorage(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    const keys = Object.keys(localStorage);
    const prefix = this.config.storagePrefix;

    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  private cleanupStorage(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    const keys = Object.keys(localStorage);
    const prefix = this.config.storagePrefix;
    const now = Date.now();

    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry: StorageCacheEntry<T> = JSON.parse(stored);
          if (now > entry.expiryTime || entry.version !== this.config.version) {
            localStorage.removeItem(key);
            this.stats.storage.evictionCount++;
          }
        }
      }
    });
  }

  private manageStorageSize(): void {
    const currentSize = this.getStorageSize();
    if (currentSize >= this.config.storageMaxSize) {
      this.cleanupStorage();
    }
  }

  private getStorageSize(): number {
    if (!this.isStorageAvailable()) {
      return 0;
    }

    const keys = Object.keys(localStorage);
    const prefix = this.config.storagePrefix;
    return keys.filter((key) => key.startsWith(prefix)).length;
  }

  private updateStorageStats(): void {
    this.stats.storage.size = this.getStorageSize();
  }

  private getStorageKey(key: string): string {
    return `${this.config.storagePrefix}${key}`;
  }

  private isStorageAvailable(): boolean {
    const testKey = "__cache_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
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
      this.stats.overall.totalHits + this.stats.overall.totalMisses;
    return totalRequests > 0
      ? (this.stats.overall.totalHits / totalRequests) * 100
      : 0;
  }

  private setupPeriodicCleanup(): void {
    // 5분마다 만료된 캐시 정리
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private emitEvent(
    type: CacheEventType,
    key: string,
    source: "memory" | "storage",
    data?: T
  ): void {
    const event: CacheEvent<T> = {
      type,
      key,
      source,
      data,
      timestamp: Date.now(),
    };

    this.eventListeners.forEach((listener) => {
      listener(event);
    });
  }
}
