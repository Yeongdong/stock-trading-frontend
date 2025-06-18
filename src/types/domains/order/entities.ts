export interface OrderExecutionInquiryRequest {
  startDate: string;
  endDate: string;
  stockCode?: string;
  orderType: string;
}

export interface OrderExecutionInquiryResponse {
  totalCount: number;
  executions: OrderExecution[];
}

export interface OrderExecution {
  orderDate: string;
  stockCode: string;
  stockName: string;
  orderType: string;
  quantity: number;
  price: number;
  executedQuantity: number;
  executedPrice: number;
  status: string;
}
