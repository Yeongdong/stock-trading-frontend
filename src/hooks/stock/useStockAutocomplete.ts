import { useState, useCallback, useRef, useEffect } from "react";
import {
  StockSearchRequest,
  StockSearchResult,
} from "@/types/domains/stock/search";
import { CacheConfig, StockAutocompleteCache } from "@/types/domains/cache";
import { stockService } from "@/services/api/stock/stockService";
import { LayeredCacheManager } from "@/utils/LayeredCacheManager";

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  memoryMaxSize: 50, // 메모리는 최소한으로
  storageMaxSize: 200, // localStorage는 더 많이
  ttl: 10 * 60 * 1000, // 10분 TTL
  version: "1.0.0", // 캐시 스키마 버전
  storagePrefix: "stock_autocomplete_",
};

/**
 * 계층적 캐싱이 적용된 주식 자동완성 훅
 */
export const useStockAutocomplete = (
  cacheConfig: Partial<CacheConfig> = {}
) => {
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 계층적 캐시 매니저 초기화
  const cacheManagerRef = useRef<LayeredCacheManager<StockAutocompleteCache>>();
  const pendingRequestsRef = useRef<Map<string, Promise<StockSearchResult[]>>>(
    new Map()
  );

  // 캐시 매니저 초기화
  useEffect(() => {
    const config = { ...DEFAULT_CACHE_CONFIG, ...cacheConfig };
    cacheManagerRef.current = new LayeredCacheManager<StockAutocompleteCache>(
      config
    );

    const pendingRequests = pendingRequestsRef.current;

    // 개발 환경에서 캐시 이벤트 로깅 (상용에서는 제거)
    if (process.env.NODE_ENV === "development")
      cacheManagerRef.current.addEventListener((event) => {
        console.log(`[Cache ${event.type}]`, event.key, event.source);
      });

    return () => {
      // 정리 작업
      pendingRequests.clear();
    };
  });

  /**
   * 캐시 키 생성
   */
  const getCacheKey = useCallback((searchTerm: string): string => {
    return searchTerm.toLowerCase().trim();
  }, []);

  /**
   * API에서 데이터 가져오기
   */
  const fetchFromAPI = useCallback(
    async (request: StockSearchRequest): Promise<StockSearchResult[]> => {
      const autocompleteRequest: StockSearchRequest = {
        ...request,
        pageSize: 10, // 자동완성은 적은 수의 결과만
      };

      const response = await stockService.searchStocks(autocompleteRequest);

      if (response?.data) return response.data.results || [];
      else throw new Error("검색 중 오류가 발생했습니다.");
    },
    []
  );

  /**
   * 자동완성 후보 가져오기 (계층적 캐싱 적용)
   */
  const fetchSuggestions = useCallback(
    async (request: StockSearchRequest) => {
      const searchTerm = request.searchTerm?.trim();

      if (!searchTerm || searchTerm.length < 1) {
        setSuggestions([]);
        return [];
      }

      const cacheKey = getCacheKey(searchTerm);
      const cacheManager = cacheManagerRef.current;

      if (!cacheManager) {
        console.warn("Cache manager not initialized");
        return [];
      }

      // 캐시에서 먼저 확인
      const cacheResult = cacheManager.get(cacheKey);
      if (cacheResult.isHit && cacheResult.data) {
        const cachedSuggestions = cacheResult.data.results;
        setSuggestions(cachedSuggestions);
        return cachedSuggestions;
      }

      // 진행 중인 요청이 있는지 확인 (중복 요청 방지)
      const pendingRequests = pendingRequestsRef.current;
      const existingRequest = pendingRequests.get(cacheKey);
      if (existingRequest) {
        const result = await existingRequest;
        setSuggestions(result);
        return result;
      }

      // 새로운 API 요청
      setIsLoading(true);
      setError(null);

      const apiRequest = fetchFromAPI(request)
        .then((results) => {
          // 캐시에 저장
          const cacheData: StockAutocompleteCache = {
            searchTerm,
            results,
            searchedAt: Date.now(),
          };
          cacheManager.set(cacheKey, cacheData);

          setSuggestions(results);
          return results;
        })
        .catch((err) => {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "알 수 없는 오류가 발생했습니다.";
          setError(errorMessage);
          setSuggestions([]);
          return [];
        })
        .finally(() => {
          setIsLoading(false);
          // 요청 완료 후 pending에서 제거
          pendingRequests.delete(cacheKey);
        });

      // 진행 중인 요청으로 등록
      pendingRequests.set(cacheKey, apiRequest);

      return apiRequest;
    },
    [getCacheKey, fetchFromAPI]
  );

  /**
   * 캐시 초기화
   */
  const clearCache = useCallback(() => {
    cacheManagerRef.current?.clear();
    pendingRequestsRef.current.clear();
  }, []);

  /**
   * 특정 검색어의 캐시 무효화
   */
  const invalidateCache = useCallback(
    (searchTerm: string) => {
      const cacheKey = getCacheKey(searchTerm);
      cacheManagerRef.current?.delete(cacheKey);
    },
    [getCacheKey]
  );

  /**
   * 자동완성 결과 초기화
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  /**
   * 캐시 통계 정보 (개발/디버깅용)
   */
  const getCacheStats = useCallback(() => {
    return cacheManagerRef.current?.getStats();
  }, []);

  /**
   * 캐시 프리워밍 (자주 검색되는 종목들 미리 캐시)
   */
  const prewarmCache = useCallback(
    async (popularTerms: string[]) => {
      const promises = popularTerms.map((term) =>
        fetchSuggestions({
          searchTerm: term,
          page: 1,
          pageSize: 10,
        })
      );

      await Promise.allSettled(promises);
    },
    [fetchSuggestions]
  );

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    clearSuggestions,
    clearCache,
    invalidateCache,
    getCacheStats,
    prewarmCache,
  };
};
