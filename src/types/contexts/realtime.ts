import { RealtimeStockData } from "../realtime/stock";

export interface RealtimePriceContextType {
  stockData: Record<string, RealtimeStockData>;
  isConnected: boolean;
  error: string | null;
  getStockData: (symbol: string) => RealtimeStockData | null;
}
