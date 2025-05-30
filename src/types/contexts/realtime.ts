import { StockTransaction } from "./stockData";

export interface RealtimePriceContextType {
  stockData: Record<string, StockTransaction>;
  isConnected: boolean;
  error: string | null;
  getStockData: (symbol: string) => StockTransaction | null;
}
