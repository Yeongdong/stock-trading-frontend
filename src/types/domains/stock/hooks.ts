import { RealtimeStockData } from "@/types/domains/realtime/entities";
import { PriceDataPoint } from "@/types/common/ui";
import {
  StockSearchRequest,
  StockSearchResponse,
  StockSearchResult,
  StockSearchSummary,
} from "@/types/domains/stock/search";
import { ProcessedChartData } from "@/utils/dataProcessor";
import { SummaryData } from "@/components/features/stock/chart/PeriodPriceChartModel";

/**
 * 주식 카드 데이터 결과
 */
export interface StockCardDataResult {
  readonly stockData: RealtimeStockData | null;
  readonly chartData: PriceDataPoint[] | null;
  readonly blinkClass: string;
  readonly isUnsubscribing: boolean;
  readonly isLoading: boolean;
  readonly handleUnsubscribe: () => Promise<void>;
}

/**
 * 차트 기간 타입
 */
export type ChartPeriod = "1m" | "5m" | "15m" | "30m" | "1h" | "1d";

/**
 * 주문 폼 데이터
 */
export interface OrderFormData {
  stockCode: string;
  orderType: string;
  quantity: string;
  price: string;
}

/**
 * 주식 주문 훅 결과
 */
export interface UseStockOrderResult {
  isLoading: boolean;
  submitOrder: (orderData: OrderFormData) => Promise<boolean>;
  validateOrder: (orderData: OrderFormData) => {
    isValid: boolean;
    error?: string;
  };
}

/**
 * 주식 검색 훅 결과
 */
export interface UseStockSearchResult {
  results: StockSearchResult[];
  searchResponse: StockSearchResponse | null;
  summary: StockSearchSummary | null;
  isLoading: boolean;
  hasSearched: boolean;
  searchStocks: (
    request: StockSearchRequest,
    isLoadMore?: boolean
  ) => Promise<StockSearchResponse | null>;
  loadMore: () => Promise<void>;
  getStockByCode: (code: string) => Promise<StockSearchResult | null>;
  getSearchSummary: () => Promise<StockSearchSummary | null>;
  clearResults: () => void;
}

/**
 * 기간별 차트 데이터 훅 결과
 */
export interface UsePeriodChartDataResult {
  processedData: ProcessedChartData | null;
  summaryData: SummaryData | null;
  hasValidData: boolean;
}
