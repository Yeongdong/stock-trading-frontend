import { CurrentPriceResponse } from "../stock/price";

export interface OrderExecutionInquiryRequest {
  startDate: string;
  endDate: string;
  stockCode?: string;
  orderType: string;
}

export interface OrderExecutionInquiryResponse {
  totalCount: number;
  executions: OrderExecution[];
  hasMore?: boolean;
}

export interface OrderExecution {
  orderDate: string;
  orderNumber?: string;
  stockCode: string;
  stockName: string;
  orderType: string;
  orderQuantity: number;
  orderPrice: number;
  executedQuantity: number;
  executedPrice: number;
  executedAmount?: number;
  executionTime?: string;
  status: string;
}

export interface BuyableInquiryData {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  buyableCash: number;
  buyableQuantity: number;
  latestPrice?: {
    currentPrice: number;
    change: number;
    changeRate: number;
  };
}
export interface BuyableInquiryRequest {
  stockCode: string;
  orderPrice: number;
  orderType?: string; // 기본값: "00" (지정가)
}

export interface BuyableInquiryResponse {
  stockCode: string;
  stockName: string;
  buyableAmount: number;
  buyableQuantity: number;
  orderableAmount: number;
  cashBalance: number;
  orderPrice: number;
  currentPrice: number;
  unitQuantity: number;
  latestPrice?: CurrentPriceResponse;
}
