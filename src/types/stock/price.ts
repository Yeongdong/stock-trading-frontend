export interface CurrentPriceRequest {
  stockCode: string;
}

export interface CurrentPriceResponse {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  priceChange: number;
  changeRate: number;
  changeType: string; // "상승" | "하락" | "보합"
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  inquiryTime: string;
}
