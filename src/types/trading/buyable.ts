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
}
