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

/**
 * 주식 관련 API 서비스
 */
export const stockService = {
  getBalance: async (): Promise<ApiResponse<Balance>> => {
    return apiClient.get<Balance>(API.STOCK.BALANCE, {
      requiresAuth: true,
    });
  },

  placeOrder: async (orderData: StockOrder): Promise<ApiResponse> => {
    return apiClient.post(API.STOCK.ORDER, orderData, {
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
      `${API.STOCK.CURRENT_PRICE}?${queryParams.toString()}`,
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
      `${API.STOCK.SEARCH}?${params.toString()}`,
      { requiresAuth: true }
    );
  },

  getStockByCode: async (
    code: string
  ): Promise<ApiResponse<StockSearchResult>> => {
    return apiClient.get<StockSearchResult>(API.STOCK.GET_BY_CODE(code), {
      requiresAuth: true,
    });
  },

  getSearchSummary: async (): Promise<ApiResponse<StockSearchSummary>> => {
    return apiClient.get<StockSearchSummary>(API.STOCK.SEARCH_SUMMARY, {
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
      `${API.STOCK.PERIOD_PRICE}?${queryParams.toString()}`,
      { requiresAuth: true }
    );
  },
};
