import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { ApiResponse } from "@/types/common/api";
import { Balance, StockOrder } from "@/types/domains/stock";
import {
  CurrentPriceRequest,
  CurrentPriceResponse,
  PeriodPriceRequest,
  PeriodPriceResponse,
} from "@/types/domains/stock/price";
import {
  StockSearchRequest,
  StockSearchResponse,
  StockSearchResult,
  StockSearchSummary,
} from "@/types/domains/stock/search";
import {
  OverseasCurrentPriceRequest,
  OverseasCurrentPriceResponse,
  OverseasPeriodPriceRequest,
  OverseasPeriodPriceResponse,
  OverseasStockSearchRequest,
  OverseasStockSearchResponse,
} from "@/types/domains/stock/overseas";
import {
  OverseasOrderExecutionItem,
  OverseasOrderResponse,
  OverseasStockOrder,
} from "@/types/domains/stock/overseas-order";
import {
  ForeignStockSearchRequest,
  ForeignStockSearchResult,
} from "@/types/domains/stock/foreignStock";

/**
 * 주식 관련 API 서비스 (국내 + 해외)
 */
export const stockService = {
  // === 국내 주식 메서드 ===
  getBalance: async (): Promise<ApiResponse<Balance>> => {
    return apiClient.get<Balance>(API.TRADING.BALANCE, {
      requiresAuth: true,
    });
  },

  placeOrder: async (orderData: StockOrder): Promise<ApiResponse> => {
    return apiClient.post(API.TRADING.ORDER, orderData, {
      requiresAuth: true,
    });
  },

  getCurrentPrice: async (
    request: CurrentPriceRequest
  ): Promise<ApiResponse<CurrentPriceResponse>> => {
    const queryParams = new URLSearchParams({
      stockCode: request.stockCode,
    });

    return apiClient.get<CurrentPriceResponse>(
      `${API.MARKET.STOCK_CURRENT_PRICE}?${queryParams.toString()}`,
      { requiresAuth: true }
    );
  },

  searchStocks: async (
    request: StockSearchRequest
  ): Promise<ApiResponse<StockSearchResponse>> => {
    const params = new URLSearchParams({
      searchTerm: request.searchTerm,
      page: (request.page || 1).toString(),
      pageSize: (request.pageSize || 20).toString(),
    });

    return apiClient.get<StockSearchResponse>(
      `${API.MARKET.STOCK_SEARCH}?${params.toString()}`,
      { requiresAuth: true }
    );
  },

  getStockByCode: async (
    code: string
  ): Promise<ApiResponse<StockSearchResult>> => {
    return apiClient.get<StockSearchResult>(
      API.MARKET.STOCK_GET_BY_CODE(code),
      {
        requiresAuth: true,
      }
    );
  },

  getSearchSummary: async (): Promise<ApiResponse<StockSearchSummary>> => {
    return apiClient.get<StockSearchSummary>(API.MARKET.STOCK_SEARCH_SUMMARY, {
      requiresAuth: true,
    });
  },

  getPeriodPrice: async (
    request: PeriodPriceRequest
  ): Promise<ApiResponse<PeriodPriceResponse>> => {
    const queryParams = new URLSearchParams({
      stockCode: request.stockCode,
      periodDivCode: request.periodDivCode,
      startDate: request.startDate,
      endDate: request.endDate,
      orgAdjPrc: request.orgAdjPrc || "0",
      marketDivCode: request.marketDivCode || "J",
    });

    return apiClient.get<PeriodPriceResponse>(
      `${API.MARKET.STOCK_PERIOD_PRICE}?${queryParams.toString()}`,
      { requiresAuth: true }
    );
  },

  // === 해외 주식 메서드 ===

  /**
   * 해외 주식 주문
   */
  placeOverseasOrder: async (
    orderData: OverseasStockOrder
  ): Promise<ApiResponse<OverseasOrderResponse>> => {
    return apiClient.post(API.TRADING.OVERSEAS_ORDER, orderData, {
      requiresAuth: true,
    });
  },

  /**
   * 해외 주식 주문 체결 내역 조회
   */
  getOverseasOrderExecutions: async (
    startDate: string,
    endDate: string
  ): Promise<
    ApiResponse<{ executions: OverseasOrderExecutionItem[]; count: number }>
  > => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    return apiClient.get(
      `${API.TRADING.OVERSEAS_EXECUTIONS}?${params.toString()}`,
      { requiresAuth: true }
    );
  },

  /**
   * 해외 주식 현재가 조회
   */
  getOverseasCurrentPrice: async (
    request: OverseasCurrentPriceRequest
  ): Promise<ApiResponse<OverseasCurrentPriceResponse>> => {
    return apiClient.get<OverseasCurrentPriceResponse>(
      API.MARKET.OVERSEAS_CURRENT_PRICE(request.stockCode, request.market),
      { requiresAuth: true }
    );
  },

  /**
   * 시장별 해외 주식 목록 조회
   */
  getOverseasStocksByMarket: async (
    request: OverseasStockSearchRequest
  ): Promise<ApiResponse<OverseasStockSearchResponse>> => {
    return apiClient.get<OverseasStockSearchResponse>(
      API.MARKET.OVERSEAS_STOCKS_BY_MARKET(request.market),
      { requiresAuth: true }
    );
  },

  /**
   * 해외 주식 검색
   */
  searchForeignStocks: async (
    request: ForeignStockSearchRequest
  ): Promise<ApiResponse<ForeignStockSearchResult>> => {
    const queryParams = new URLSearchParams({
      market: request.market,
      query: request.query,
      limit: (request.limit || 50).toString(),
    });

    return apiClient.get<ForeignStockSearchResult>(
      `${API.MARKET.FOREIGN_STOCK_SEARCH}?${queryParams.toString()}`,
      { requiresAuth: true }
    );
  },

  // 해외 주식 기간별 시세 조회
  getOverseasPeriodPrice: async (
    request: OverseasPeriodPriceRequest
  ): Promise<ApiResponse<OverseasPeriodPriceResponse>> => {
    const queryParams = new URLSearchParams({
      stockCode: request.stockCode,
      marketDivCode: request.marketDivCode,
      periodDivCode: request.periodDivCode,
      startDate: request.startDate,
      endDate: request.endDate,
    });

    return apiClient.get<OverseasPeriodPriceResponse>(
      `${API.MARKET.OVERSEAS_PERIOD_PRICE}?${queryParams.toString()}`,
      { requiresAuth: true }
    );
  },
};
