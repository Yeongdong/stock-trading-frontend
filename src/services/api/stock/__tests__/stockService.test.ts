import { stockService } from "../stockService";
import { apiClient } from "@/services/api/common/apiClient";
import { ApiResponse } from "@/types/common/api";
import { Balance, Summary } from "@/types/domains/stock/balance";
import { StockOrder } from "@/types/domains/stock/entities";
import {
  CurrentPriceRequest,
  CurrentPriceResponse,
} from "@/types/domains/stock/price";
import {
  StockSearchRequest,
  StockSearchResponse,
} from "@/types/domains/stock/search";

// Mock 설정
jest.mock("@/services/api/common/apiClient");
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("stockService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createResponse = <T>(
    data?: T,
    error?: string,
    status = 200
  ): ApiResponse<T> => ({
    data,
    error,
    status,
  });

  // === 국내 주식 핵심 기능 ===
  describe("국내 주식", () => {
    it("잔고를 조회한다", async () => {
      const mockBalance: Balance = {
        positions: [],
        summary: {} as Summary,
      };
      mockApiClient.get.mockResolvedValue(createResponse(mockBalance));

      const result = await stockService.getBalance();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/Trading/balance"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockBalance);
    });

    it("현재가를 조회한다", async () => {
      const request: CurrentPriceRequest = { stockCode: "005930" };
      const mockPrice: CurrentPriceResponse = {
        stockCode: "005930",
        stockName: "삼성전자",
        currentPrice: 80000,
        priceChange: 2000,
        changeRate: 2.56,
        changeType: "상승",
        openPrice: 78000,
        highPrice: 81000,
        lowPrice: 77500,
        volume: 1500000,
        inquiryTime: "2025-07-16T15:30:00",
      };
      mockApiClient.get.mockResolvedValue(createResponse(mockPrice));

      const result = await stockService.getCurrentPrice(request);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/market/Price/domestic/current-price"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockPrice);
    });

    it("주식을 검색한다", async () => {
      const request: StockSearchRequest = {
        searchTerm: "삼성",
        page: 1,
        pageSize: 20,
      };
      const mockSearch: StockSearchResponse = {
        results: [
          {
            code: "005930",
            name: "삼성전자",
            sector: "반도체",
            market: "KOSPI",
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 20,
        hasMore: false,
      };
      mockApiClient.get.mockResolvedValue(createResponse(mockSearch));

      const result = await stockService.searchStocks(request);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/market/Stock/search"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockSearch);
    });

    it("종목 코드로 주식 정보를 조회한다", async () => {
      const mockStock = {
        code: "005930",
        name: "삼성전자",
        sector: "반도체",
        market: "KOSPI",
      };
      mockApiClient.get.mockResolvedValue(createResponse(mockStock));

      const result = await stockService.getStockByCode("005930");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/market/Stock/005930"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockStock);
    });

    it("검색 요약 정보를 조회한다", async () => {
      const mockSummary = {
        totalStocks: 2500,
        kospiCount: 900,
        kosdaqCount: 1500,
      };
      mockApiClient.get.mockResolvedValue(createResponse(mockSummary));

      const result = await stockService.getSearchSummary();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/market/Stock/search/summary"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockSummary);
    });

    it("기간별 시세를 조회한다", async () => {
      const mockPeriodPrice = { stockCode: "005930", priceData: [] };
      mockApiClient.get.mockResolvedValue(createResponse(mockPeriodPrice));

      const result = await stockService.getPeriodPrice({
        stockCode: "005930",
        periodDivCode: "D",
        startDate: "20250715",
        endDate: "20250716",
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/market/Price/domestic/period-price"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockPeriodPrice);
    });

    it("주문을 처리한다", async () => {
      const orderData: StockOrder = {
        acntPrdtCd: "01",
        trId: "TTTC0802U",
        pdno: "005930",
        ordDvsn: "00",
        ordQty: "10",
        ordUnpr: "80000",
      };
      mockApiClient.post.mockResolvedValue(createResponse({}));

      const result = await stockService.placeOrder(orderData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        expect.stringContaining("/Trading/order"),
        orderData,
        { requiresAuth: true }
      );
      expect(result.error).toBeUndefined();
    });
  });

  // === 해외 주식 핵심 기능 ===
  describe("해외 주식", () => {
    it("해외 현재가를 조회한다", async () => {
      const mockPrice = {
        stockCode: "AAPL",
        stockName: "Apple Inc.",
        currentPrice: 150.25,
        currency: "USD",
      };
      mockApiClient.get.mockResolvedValue(createResponse(mockPrice));

      const result = await stockService.getOverseasCurrentPrice({
        stockCode: "AAPL",
        market: "nas",
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("current-price/AAPL?market=nas"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockPrice);
    });

    it("해외 주문을 처리한다", async () => {
      const orderData = {
        acntPrdtCd: "01",
        trId: "VTTT1002U",
        pdno: "AAPL",
        ordDvsn: "00",
        ordQty: "5",
        ordUnpr: "150.00",
        ovsExcgCd: "NASD",
        ordCndt: "DAY",
      };
      mockApiClient.post.mockResolvedValue(createResponse({}));

      const result = await stockService.placeOverseasOrder(orderData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        expect.stringContaining("/Trading/overseas/order"),
        orderData,
        { requiresAuth: true }
      );
      expect(result.error).toBeUndefined();
    });

    it("해외 주문 체결 내역을 조회한다", async () => {
      const mockExecutions = { executions: [], count: 0 };
      mockApiClient.get.mockResolvedValue(createResponse(mockExecutions));

      const result = await stockService.getOverseasOrderExecutions(
        "20250715",
        "20250716"
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/Trading/overseas/executions"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockExecutions);
    });

    it("시장별 해외 주식 목록을 조회한다", async () => {
      const mockStocks = { market: "nas", stocks: [], totalCount: 0 };
      mockApiClient.get.mockResolvedValue(createResponse(mockStocks));

      const result = await stockService.getOverseasStocksByMarket({
        market: "nas",
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/market/Stock/overseas/markets/nas"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockStocks);
    });

    it("해외 주식을 검색한다", async () => {
      const mockSearch = {
        stocks: [{ symbol: "AAPL", description: "애플" }],
        count: 1,
        market: "NASDAQ",
      };
      mockApiClient.get.mockResolvedValue(createResponse(mockSearch));

      const result = await stockService.searchForeignStocks({
        market: "NASDAQ",
        query: "AAPL",
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/market/Stock/overseas/search"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockSearch);
    });

    it("해외 주식 기간별 시세를 조회한다", async () => {
      const mockPeriodPrice = { stockCode: "AAPL", priceData: [] };
      mockApiClient.get.mockResolvedValue(createResponse(mockPeriodPrice));

      const result = await stockService.getOverseasPeriodPrice({
        stockCode: "AAPL",
        marketDivCode: "N",
        periodDivCode: "D",
        startDate: "20250715",
        endDate: "20250716",
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("/market/Price/overseas/period-price"),
        { requiresAuth: true }
      );
      expect(result.data).toEqual(mockPeriodPrice);
    });
  });

  // === 에러 처리 ===
  describe("에러 처리", () => {
    it("네트워크 에러를 처리한다", async () => {
      mockApiClient.get.mockRejectedValue(new Error("Network Error"));

      await expect(stockService.getBalance()).rejects.toThrow("Network Error");
    });

    it("API 에러를 처리한다", async () => {
      mockApiClient.get.mockResolvedValue(
        createResponse(undefined, "API 에러", 500)
      );

      const result = await stockService.getCurrentPrice({
        stockCode: "005930",
      });

      expect(result.error).toBe("API 에러");
      expect(result.status).toBe(500);
    });

    it("인증 에러를 처리한다", async () => {
      mockApiClient.get.mockResolvedValue(
        createResponse(undefined, "인증 만료", 401)
      );

      const result = await stockService.getBalance();

      expect(result.status).toBe(401);
    });

    it("Rate Limiting을 처리한다", async () => {
      mockApiClient.get.mockResolvedValue(
        createResponse(undefined, "요청 한도 초과", 429)
      );

      const result = await stockService.getCurrentPrice({
        stockCode: "005930",
      });

      expect(result.status).toBe(429);
    });
  });
});
