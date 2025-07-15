import { renderHook, act } from "@testing-library/react";
import { useStockSearch } from "../useStockSearch";
import { stockService } from "@/services/api/stock/stockService";
import {
  StockSearchResponse,
  StockSearchResult,
  StockSearchSummary,
} from "@/types/domains/stock/search";
import { ApiResponse } from "@/types/common/api";

// Mock 서비스
jest.mock("@/services/api/stock/stockService");
const mockStockService = stockService as jest.Mocked<typeof stockService>;

// Mock 데이터
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
  pageSize: 20,
  hasMore: false,
};

const mockSummary: StockSearchSummary = {
  totalStocks: 2500,
  kospiCount: 900,
  kosdaqCount: 1500,
  konexCount: 100,
  lastUpdated: "2025-07-14",
};

const createResponse = <T>(data: T, hasError = false): ApiResponse<T> => ({
  data: hasError ? undefined : data,
  error: hasError ? "API 에러" : undefined,
  status: hasError ? 500 : 200,
});

describe("useStockSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("초기 상태", () => {
    it("초기값이 올바르게 설정되어야 한다", () => {
      const { result } = renderHook(() => useStockSearch());

      expect(result.current.results).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasSearched).toBe(false);
    });
  });

  describe("searchStocks", () => {
    it("검색 성공 시 결과를 반환해야 한다", async () => {
      mockStockService.searchStocks.mockResolvedValue(
        createResponse(mockSearchResponse)
      );

      const { result } = renderHook(() => useStockSearch());

      await act(async () => {
        const response = await result.current.searchStocks({
          searchTerm: "삼성",
          page: 1,
          pageSize: 20,
        });
        expect(response).toEqual(mockSearchResponse);
      });

      expect(result.current.results).toEqual([mockSearchResult]);
      expect(result.current.hasSearched).toBe(true);
    });

    it("검색 실패 시 null을 반환해야 한다", async () => {
      mockStockService.searchStocks.mockResolvedValue(
        createResponse({} as StockSearchResponse, true)
      );

      const { result } = renderHook(() => useStockSearch());

      await act(async () => {
        const response = await result.current.searchStocks({
          searchTerm: "없는종목",
        });
        expect(response).toBeNull();
      });

      expect(result.current.results).toEqual([]);
    });
  });

  describe("loadMore", () => {
    it("더보기가 동작해야 한다", async () => {
      const moreResult: StockSearchResult = {
        code: "000660",
        name: "SK하이닉스",
        sector: "반도체",
        market: "KOSPI",
      };

      // 첫 검색
      mockStockService.searchStocks.mockResolvedValueOnce(
        createResponse({ ...mockSearchResponse, hasMore: true })
      );

      // 더보기
      mockStockService.searchStocks.mockResolvedValueOnce(
        createResponse({
          results: [moreResult],
          totalCount: 2,
          page: 2,
          pageSize: 20,
          hasMore: false,
        })
      );

      const { result } = renderHook(() => useStockSearch());

      await act(async () => {
        await result.current.searchStocks({ searchTerm: "반도체" });
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.results).toHaveLength(2);
      expect(result.current.results[1]).toEqual(moreResult);
    });
  });

  describe("getStockByCode", () => {
    it("종목 코드로 조회가 성공해야 한다", async () => {
      mockStockService.getStockByCode.mockResolvedValue(
        createResponse(mockSearchResult)
      );

      const { result } = renderHook(() => useStockSearch());

      await act(async () => {
        const stock = await result.current.getStockByCode("005930");
        expect(stock).toEqual(mockSearchResult);
      });
    });
  });

  describe("getSearchSummary", () => {
    it("요약 정보를 조회해야 한다", async () => {
      mockStockService.getSearchSummary.mockResolvedValue(
        createResponse(mockSummary)
      );

      const { result } = renderHook(() => useStockSearch());

      await act(async () => {
        await result.current.getSearchSummary();
      });

      expect(result.current.summary).toEqual(mockSummary);
    });
  });

  describe("clearResults", () => {
    it("모든 상태를 초기화해야 한다", async () => {
      mockStockService.searchStocks.mockResolvedValue(
        createResponse(mockSearchResponse)
      );

      const { result } = renderHook(() => useStockSearch());

      // 검색 실행
      await act(async () => {
        await result.current.searchStocks({ searchTerm: "삼성" });
      });

      // 초기화
      act(() => {
        result.current.clearResults();
      });

      expect(result.current.results).toEqual([]);
      expect(result.current.hasSearched).toBe(false);
    });
  });
});
