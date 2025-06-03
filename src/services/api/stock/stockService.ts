import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import {
  StockOrder,
  StockBalance,
  CurrentPriceResponse,
  CurrentPriceRequest,
  StockSearchRequest,
  StockSearchResult,
  StockSearchSummary,
} from "@/types";

export const stockService = {
  getBalance: async () => {
    return apiClient.get<StockBalance>(API.STOCK.BALANCE, {
      requiresAuth: true,
    });
  },

  placeOrder: async (orderData: StockOrder) => {
    return apiClient.post(API.STOCK.ORDER, orderData, { requiresAuth: true });
  },

  getCurrentPrice: async (request: CurrentPriceRequest) => {
    const queryParams = new URLSearchParams({ stockCode: request.stockCode });

    return apiClient.get<CurrentPriceResponse>(
      `${API.STOCK.CURRENT_PRICE}?${queryParams.toString()}`,
      { requiresAuth: true }
    );
  },

  searchStocks: async (request: StockSearchRequest) => {
    const params = new URLSearchParams({
      searchTerm: request.searchTerm,
      page: (request.page || 1).toString(),
      pageSize: (request.pageSize || 20).toString(),
    });

    const response = await apiClient.get<StockSearchResult[]>(
      `${API.STOCK.SEARCH}?${params.toString()}`,
      { requiresAuth: true }
    );

    return {
      results: response.data || [],
      totalCount: response.data?.length || 0,
      page: request.page || 1,
      pageSize: request.pageSize || 20,
      hasMore: (response.data?.length || 0) === (request.pageSize || 20),
    };
  },

  // 종목 코드로 조회
  getStockByCode: async (code: string): Promise<StockSearchResult | null> => {
    const response = await apiClient.get<StockSearchResult>(
      `${API.STOCK.GET_BY_CODE(code)}`,
      { requiresAuth: true }
    );

    return response.data || null;
  },

  // 검색 요약 정보
  getSearchSummary: async (): Promise<StockSearchSummary> => {
    const response = await apiClient.get<StockSearchSummary>(
      API.STOCK.SEARCH_SUMMARY,
      { requiresAuth: true }
    );

    return response.data!;
  },
};
