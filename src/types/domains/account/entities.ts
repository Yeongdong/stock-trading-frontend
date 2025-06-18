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
