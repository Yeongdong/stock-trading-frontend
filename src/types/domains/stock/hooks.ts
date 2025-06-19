import { RealtimeStockData } from "@/types/domains/realtime/entities";
import { PriceDataPoint } from "@/types/common/ui";

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
