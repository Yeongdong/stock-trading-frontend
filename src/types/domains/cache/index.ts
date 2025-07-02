import { StockSearchResult } from "@/types/domains/stock/search";

/**
 * 캐싱 관련 타입 정의
 */

/**
 * 캐시 항목 기본 구조
 */
export interface BaseCacheEntry<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
}

/**
 * 메모리 캐시 항목 (추가 메타데이터 포함)
 */
export interface MemoryCacheEntry<T> extends BaseCacheEntry<T> {
  accessCount: number;
  lastAccessed: number;
}

/**
 * 스토리지 캐시 항목
 */
export interface StorageCacheEntry<T> extends BaseCacheEntry<T> {
  version: string; // 캐시 버전 관리
}

/**
 * 캐시 설정
 */
export interface CacheConfig {
  /** 메모리 캐시 최대 크기 */
  memoryMaxSize: number;
  /** 스토리지 캐시 최대 크기 */
  storageMaxSize: number;
  /** Time To Live (밀리초) */
  ttl: number;
  /** 캐시 버전 (스키마 변경 시 기존 캐시 무효화) */
  version: string;
  /** localStorage 키 접두사 */
  storagePrefix: string;
}

/**
 * 캐시 조회 결과
 */
export interface CacheHitResult<T> {
  /** 캐시 히트 여부 */
  isHit: boolean;
  /** 캐시 소스 */
  source: "memory" | "storage" | "miss";
  /** 캐시된 데이터 */
  data?: T;
  /** 캐시 메타데이터 */
  metadata?: {
    cachedAt: number;
    expiresAt: number;
    accessCount?: number;
  };
}

/**
 * 캐시 통계
 */
export interface CacheStats {
  memory: {
    size: number;
    maxSize: number;
    hitCount: number;
    missCount: number;
    evictionCount: number;
  };
  storage: {
    size: number;
    maxSize: number;
    hitCount: number;
    missCount: number;
    evictionCount: number;
  };
  overall: {
    totalHits: number;
    totalMisses: number;
    hitRate: number;
  };
}

/**
 * 캐시 매니저 인터페이스
 */
export interface ICacheManager<T> {
  /** 캐시에서 데이터 조회 */
  get(key: string): CacheHitResult<T>;

  /** 캐시에 데이터 저장 */
  set(key: string, data: T): void;

  /** 특정 키의 캐시 삭제 */
  delete(key: string): boolean;

  /** 모든 캐시 삭제 */
  clear(): void;

  /** 만료된 캐시 정리 */
  cleanup(): void;

  /** 캐시 통계 조회 */
  getStats(): CacheStats;

  /** 캐시 설정 조회 */
  getConfig(): CacheConfig;
}

/**
 * 주식 검색 자동완성 관련 캐시 타입
 */
export interface StockAutocompleteCache {
  /** 검색어 */
  searchTerm: string;
  /** 검색 결과 */
  results: StockSearchResult[];
  /** 검색 시점 */
  searchedAt: number;
}

/**
 * 캐시 이벤트 타입
 */
export type CacheEventType =
  | "hit"
  | "miss"
  | "set"
  | "delete"
  | "clear"
  | "evict";

export interface CacheEvent<T> {
  type: CacheEventType;
  key: string;
  source: "memory" | "storage";
  data?: T;
  timestamp: number;
}
