export interface OrderExecutionInquiryRequest {
  startDate: string;
  endDate: string;
  stockCode?: string;
  orderType: string; // 01:매도, 02:매수, 00:전체
}

export interface OrderExecutionItem {
  orderDate: string;
  orderNumber: string;
  stockCode: string;
  stockName: string;
  orderSide: string; // 매도/매수
  orderQuantity: number;
  orderPrice: number;
  executedQuantity: number;
  executedPrice: number;
  executedAmount: number;
  orderStatus: string;
  executionTime: string;
}

export interface OrderExecutionInquiryResponse {
  executionItems: OrderExecutionItem[];
  totalCount: number;
  hasMore: boolean;
}
