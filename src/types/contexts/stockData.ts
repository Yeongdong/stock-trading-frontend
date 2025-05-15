import { StockTransaction } from "../realtime";

export interface PriceDataPoint {
  time: string;
  price: number;
}

export interface ChartDataState {
  [symbol: string]: PriceDataPoint[];
}

export interface ChartDataContextType {
  getChartData: (symbol: string) => PriceDataPoint[];
  removeChartData: (symbol: string) => void;
}

export interface StockDataContextType {
  stockData: Record<string, StockTransaction>;
  subscribedSymbols: string[];
  isLoading: boolean;
  error: string | null;
  subscribeSymbol: (symbol: string) => Promise<boolean>;
  unsubscribeSymbol: (symbol: string) => Promise<boolean>;
  isSubscribed: (symbol: string) => boolean;
  getStockData: (symbol: string) => StockTransaction | null;
  getChartData: (symbol: string) => PriceDataPoint[];
}

export interface StockSubscriptionContextType {
  subscribedSymbols: string[];
  isLoading: boolean;
  error: string | null;
  subscribeSymbol: (symbol: string) => Promise<boolean>;
  unsubscribeSymbol: (symbol: string) => Promise<boolean>;
  isSubscribed: (symbol: string) => boolean;
}
