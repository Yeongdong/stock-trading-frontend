export interface RealtimeStockData {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate: number;
  volume: number;
  timestamp: string;
}

export interface SubscriptionsResponse {
  symbols: string[];
}
