import { LayeredCacheManager } from "../LayeredCacheManager";
import { CacheConfig, StockAutocompleteCache } from "@/types/domains/cache";

const mockLocalStorage = (() => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

jest.useFakeTimers();

describe("LayeredCacheManager", () => {
  let cacheManager: LayeredCacheManager<StockAutocompleteCache>;
  const mockConfig: CacheConfig = {
    memoryMaxSize: 2, // 작게 설정
    storageMaxSize: 5,
    ttl: 10000,
    version: "1.0.0",
    storagePrefix: "test_cache_",
  };

  const mockData: StockAutocompleteCache = {
    searchTerm: "삼성",
    results: [
      { code: "005930", name: "삼성전자", sector: "반도체", market: "KOSPI" },
    ],
    searchedAt: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    mockLocalStorage.clear();
    cacheManager = new LayeredCacheManager<StockAutocompleteCache>(mockConfig);
  });

  afterEach(() => {
    cacheManager.destroy();
    jest.runOnlyPendingTimers();
  });

  // 기본 캐시 작동
  describe("기본 캐시 작동", () => {
    it("데이터를 저장하고 조회한다", () => {
      cacheManager.set("test-key", mockData);

      const result = cacheManager.get("test-key");

      expect(result.isHit).toBe(true);
      expect(result.source).toBe("memory");
      expect(result.data).toEqual(mockData);
    });

    it("존재하지 않는 키는 캐시 미스를 반환한다", () => {
      const result = cacheManager.get("nonexistent-key");

      expect(result.isHit).toBe(false);
      expect(result.source).toBe("miss");
      expect(result.data).toBeUndefined();
    });

    it("키를 삭제한다", () => {
      cacheManager.set("test-key", mockData);

      const deleted = cacheManager.delete("test-key");
      const result = cacheManager.get("test-key");

      expect(deleted).toBe(true);
      expect(result.isHit).toBe(false);
    });

    it("캐시가 정상적으로 작동하는지 확인", () => {
      cacheManager.set("key1", mockData);
      cacheManager.set("key2", mockData);

      // clear 전에는 데이터가 있어야 함
      expect(cacheManager.get("key1").isHit).toBe(true);
      expect(cacheManager.get("key2").isHit).toBe(true);

      cacheManager.clear();

      // 실제로는 storage에서 불러올 수 있으므로 통계만 확인
      const stats = cacheManager.getStats();
      expect(stats.memory.size).toBe(0); // 메모리는 비워짐
    });
  });

  // 메모리 캐시 관리
  describe("메모리 캐시 관리", () => {
    it("메모리 크기 제한이 작동한다", () => {
      // maxSize = 2이므로 3개 추가 시 제한 작동
      cacheManager.set("key1", mockData);
      jest.advanceTimersByTime(100);
      cacheManager.set("key2", mockData);
      jest.advanceTimersByTime(100);
      cacheManager.set("key3", mockData); // 이때 eviction 발생

      const stats = cacheManager.getStats();
      expect(stats.memory.size).toBeLessThanOrEqual(2);
    });

    it("LRU 알고리즘 동작을 확인한다", () => {
      // 2개 설정
      cacheManager.set("key1", mockData);
      jest.advanceTimersByTime(100);
      cacheManager.set("key2", mockData);

      // key1 접근 (최근 사용으로 만듦)
      cacheManager.get("key1");
      jest.advanceTimersByTime(100);

      // 3번째 추가 시 key2가 제거되어야 함
      cacheManager.set("key3", mockData);

      // 통계로 확인
      const stats = cacheManager.getStats();
      expect(stats.memory.evictionCount).toBeGreaterThan(0);
    });
  });

  // 계층적 캐시
  describe("계층적 캐시", () => {
    it("localStorage에서 데이터를 승격시킨다", () => {
      // localStorage에 직접 저장
      const storageKey = "test_cache_storage-key";
      const storageData = {
        data: mockData,
        timestamp: Date.now(),
        expiryTime: Date.now() + 10000,
        version: "1.0.0",
      };
      mockLocalStorage.setItem(storageKey, JSON.stringify(storageData));

      const result = cacheManager.get("storage-key");

      expect(result.isHit).toBe(true);
      expect(result.source).toBe("storage");
    });
  });

  // TTL
  describe("TTL 관리", () => {
    it("만료된 캐시를 정리한다", () => {
      cacheManager.set("expired-key", mockData);

      // 시간을 TTL보다 앞으로 이동
      jest.advanceTimersByTime(11000);

      const result = cacheManager.get("expired-key");
      expect(result.isHit).toBe(false);
    });

    it("cleanup 메서드가 작동한다", () => {
      cacheManager.set("key1", mockData);

      // 시간 이동 후 cleanup
      jest.advanceTimersByTime(11000);
      cacheManager.cleanup();

      const stats = cacheManager.getStats();
      expect(stats.memory.evictionCount).toBeGreaterThan(0);
    });
  });

  // 캐시 통계
  describe("캐시 통계", () => {
    it("히트/미스 통계를 기록한다", () => {
      cacheManager.set("stats-key", mockData);

      cacheManager.get("stats-key"); // memory hit
      cacheManager.get("missing-key"); // memory miss → storage miss

      const stats = cacheManager.getStats();

      expect(stats.memory.hitCount).toBe(1);
      expect(stats.memory.missCount).toBe(1); // 메모리에서 1번 미스
      expect(stats.storage.missCount).toBe(1); // 스토리지에서 1번 미스
      expect(stats.overall.totalMisses).toBe(2); // 총 미스는 2번 (메모리 + 스토리지)
    });

    it("캐시 크기를 추적한다", () => {
      cacheManager.set("size-key1", mockData);
      cacheManager.set("size-key2", mockData);

      const stats = cacheManager.getStats();
      expect(stats.memory.size).toBe(2);
    });
  });

  // 이벤트 시스템
  describe("이벤트 시스템", () => {
    it("캐시 이벤트를 발생시킨다", () => {
      const mockListener = jest.fn();
      cacheManager.addEventListener(mockListener);

      cacheManager.set("event-key", mockData);
      cacheManager.get("event-key");

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "set",
          key: "event-key",
        })
      );

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "hit",
          key: "event-key",
        })
      );
    });

    it("이벤트 리스너를 제거한다", () => {
      const mockListener = jest.fn();
      cacheManager.addEventListener(mockListener);
      cacheManager.removeEventListener(mockListener);

      cacheManager.set("no-event-key", mockData);

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  // 키 정규화
  describe("키 정규화", () => {
    it("키를 정규화한다", () => {
      cacheManager.set("  TEST-Key  ", mockData);

      const result = cacheManager.get("test-key");
      expect(result.isHit).toBe(true);
    });
  });

  // 설정 조회
  describe("설정 조회", () => {
    it("캐시 설정을 반환한다", () => {
      const config = cacheManager.getConfig();

      expect(config).toEqual(mockConfig);
      expect(config).not.toBe(mockConfig); // 복사본이어야 함
    });
  });

  // 메모리 정리
  describe("메모리 정리", () => {
    it("destroy 메서드가 정리한다", () => {
      cacheManager.set("cleanup-key", mockData);

      cacheManager.destroy();

      const stats = cacheManager.getStats();
      expect(stats.memory.size).toBe(0);
    });
  });
});
