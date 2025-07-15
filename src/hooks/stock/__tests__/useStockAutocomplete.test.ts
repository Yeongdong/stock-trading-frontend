import { renderHook, act } from "@testing-library/react";
import { useStockAutocomplete } from "../useStockAutocomplete";
import { stockService } from "@/services/api/stock/stockService";
import { LayeredCacheManager } from "@/utils/LayeredCacheManager";
import {
  StockSearchRequest,
  StockSearchResult,
  StockSearchResponse,
} from "@/types/domains/stock/search";
import {
  CacheConfig,
  StockAutocompleteCache,
  CacheHitResult,
} from "@/types/domains/cache";
import { ApiResponse } from "@/types/common/api";

jest.mock("@/services/api/stock/stockService");
jest.mock("@/utils/LayeredCacheManager");

const mockStockService = stockService as jest.Mocked<typeof stockService>;

const mockSearchResult: StockSearchResult = {
  code: "005930",
  name: "삼성전자",
  sector: "반도체",
  market: "KOSPI",
};

const mockSearchResponse: StockSearchResponse = {
  results: [mockSearchResult],
  totalCount: 1,
  page: 1,
  pageSize: 10,
  hasMore: false,
};

const mockCacheData: StockAutocompleteCache = {
  searchTerm: "삼성",
  results: [mockSearchResult],
  searchedAt: Date.now(),
};

const createApiResponse = (
  data: StockSearchResponse,
  hasError = false
): ApiResponse<StockSearchResponse> => ({
  data: hasError ? undefined : data,
  error: hasError ? "API 에러" : undefined,
  status: hasError ? 500 : 200,
});

const createCacheHitResult = <T>(
  isHit: boolean,
  data?: T
): CacheHitResult<T> => ({
  isHit,
  source: isHit ? "memory" : "miss",
  data,
  metadata: isHit
    ? {
        cachedAt: Date.now() - 1000,
        expiresAt: Date.now() + 9 * 60 * 1000,
        accessCount: 1,
      }
    : undefined,
});

describe("useStockAutocomplete", () => {
  let mockCacheManager: jest.Mocked<
    LayeredCacheManager<StockAutocompleteCache>
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      cleanup: jest.fn(),
      getStats: jest.fn(),
      getConfig: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as unknown as jest.Mocked<LayeredCacheManager<StockAutocompleteCache>>;

    (LayeredCacheManager as jest.Mock).mockImplementation(
      () => mockCacheManager
    );
  });

  describe("초기 상태", () => {
    it("초기값이 올바르게 설정되어야 한다", () => {
      const { result } = renderHook(() => useStockAutocomplete());

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("캐시 매니저가 올바른 설정으로 초기화되어야 한다", () => {
      renderHook(() => useStockAutocomplete());

      expect(LayeredCacheManager).toHaveBeenCalledWith(
        expect.objectContaining({
          memoryMaxSize: 50,
          storageMaxSize: 200,
          ttl: 10 * 60 * 1000,
          version: "1.0.0",
          storagePrefix: "stock_autocomplete_",
        })
      );
    });

    it("커스텀 캐시 설정이 적용되어야 한다", () => {
      const customConfig: Partial<CacheConfig> = {
        memoryMaxSize: 100,
        ttl: 5 * 60 * 1000,
      };

      renderHook(() => useStockAutocomplete(customConfig));

      expect(LayeredCacheManager).toHaveBeenCalledWith(
        expect.objectContaining({
          memoryMaxSize: 100,
          ttl: 5 * 60 * 1000,
        })
      );
    });
  });

  describe("fetchSuggestions", () => {
    const searchRequest: StockSearchRequest = {
      searchTerm: "삼성",
      page: 1,
      pageSize: 10,
    };

    it("캐시 히트 시 API 호출 없이 결과를 반환해야 한다", async () => {
      mockCacheManager.get.mockReturnValue(
        createCacheHitResult(true, mockCacheData)
      );

      const { result } = renderHook(() => useStockAutocomplete());

      await act(async () => {
        const suggestions = await result.current.fetchSuggestions(
          searchRequest
        );
        expect(suggestions).toEqual([mockSearchResult]);
      });

      expect(result.current.suggestions).toEqual([mockSearchResult]);
      expect(mockStockService.searchStocks).not.toHaveBeenCalled();
      expect(mockCacheManager.get).toHaveBeenCalledWith("삼성");
    });

    it("캐시 미스 시 API 호출 후 캐시에 저장해야 한다", async () => {
      mockCacheManager.get.mockReturnValue(createCacheHitResult(false));
      mockStockService.searchStocks.mockResolvedValue(
        createApiResponse(mockSearchResponse)
      );

      const { result } = renderHook(() => useStockAutocomplete());

      await act(async () => {
        await result.current.fetchSuggestions(searchRequest);
      });

      expect(mockStockService.searchStocks).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: "삼성",
          pageSize: 10,
        })
      );

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        "삼성",
        expect.objectContaining({
          searchTerm: "삼성",
          results: [mockSearchResult],
        })
      );

      expect(result.current.suggestions).toEqual([mockSearchResult]);
    });

    it("API 에러 시 에러 상태를 설정해야 한다", async () => {
      mockCacheManager.get.mockReturnValue(createCacheHitResult(false));
      mockStockService.searchStocks.mockResolvedValue(
        createApiResponse(mockSearchResponse, true)
      );

      const { result } = renderHook(() => useStockAutocomplete());

      await act(async () => {
        await result.current.fetchSuggestions(searchRequest);
      });

      expect(result.current.error).toBe("검색 중 오류가 발생했습니다.");
      expect(result.current.suggestions).toEqual([]);
    });

    it("빈 검색어는 무시해야 한다", async () => {
      const { result } = renderHook(() => useStockAutocomplete());

      await act(async () => {
        const suggestions = await result.current.fetchSuggestions({
          searchTerm: "",
        });
        expect(suggestions).toEqual([]);
      });

      expect(result.current.suggestions).toEqual([]);
      expect(mockStockService.searchStocks).not.toHaveBeenCalled();
    });

    it("로딩 상태가 올바르게 관리되어야 한다", async () => {
      mockCacheManager.get.mockReturnValue(createCacheHitResult(false));

      let resolveApiCall: (value: ApiResponse<StockSearchResponse>) => void;
      const apiPromise = new Promise<ApiResponse<StockSearchResponse>>(
        (resolve) => {
          resolveApiCall = resolve;
        }
      );

      mockStockService.searchStocks.mockReturnValue(apiPromise);

      const { result } = renderHook(() => useStockAutocomplete());

      act(() => {
        result.current.fetchSuggestions(searchRequest);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveApiCall!(createApiResponse(mockSearchResponse));
        await apiPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("캐시 관리", () => {
    it("clearCache가 캐시를 초기화해야 한다", () => {
      const { result } = renderHook(() => useStockAutocomplete());

      act(() => {
        result.current.clearCache();
      });

      expect(mockCacheManager.clear).toHaveBeenCalled();
    });

    it("invalidateCache가 특정 키를 삭제해야 한다", () => {
      const { result } = renderHook(() => useStockAutocomplete());

      act(() => {
        result.current.invalidateCache("삼성");
      });

      expect(mockCacheManager.delete).toHaveBeenCalledWith("삼성");
    });

    it("getCacheStats가 캐시 통계를 반환해야 한다", () => {
      const mockStats = {
        memory: {
          size: 10,
          maxSize: 50,
          hitCount: 5,
          missCount: 2,
          evictionCount: 0,
        },
        storage: {
          size: 20,
          maxSize: 200,
          hitCount: 8,
          missCount: 3,
          evictionCount: 1,
        },
        overall: { totalHits: 13, totalMisses: 5, hitRate: 0.72 },
      };

      mockCacheManager.getStats.mockReturnValue(mockStats);

      const { result } = renderHook(() => useStockAutocomplete());

      const stats = result.current.getCacheStats();
      expect(stats).toEqual(mockStats);
    });
  });

  describe("clearSuggestions", () => {
    it("자동완성 결과와 에러를 초기화해야 한다", async () => {
      mockCacheManager.get.mockReturnValue(
        createCacheHitResult(true, mockCacheData)
      );

      const { result } = renderHook(() => useStockAutocomplete());

      // 먼저 결과를 설정
      await act(async () => {
        await result.current.fetchSuggestions({
          searchTerm: "삼성",
        });
      });

      expect(result.current.suggestions).toEqual([mockSearchResult]);

      // 초기화 실행
      act(() => {
        result.current.clearSuggestions();
      });

      expect(result.current.suggestions).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe("prewarmCache", () => {
    it("인기 검색어들을 미리 캐시해야 한다", async () => {
      mockCacheManager.get.mockReturnValue(createCacheHitResult(false));
      mockStockService.searchStocks.mockResolvedValue(
        createApiResponse(mockSearchResponse)
      );

      const { result } = renderHook(() => useStockAutocomplete());

      await act(async () => {
        await result.current.prewarmCache(["삼성전자", "SK하이닉스"]);
      });

      expect(mockStockService.searchStocks).toHaveBeenCalledTimes(2);
      expect(mockStockService.searchStocks).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerm: "삼성전자" })
      );
      expect(mockStockService.searchStocks).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerm: "SK하이닉스" })
      );
    });
  });
});
