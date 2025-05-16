import { StockTransaction } from "../realtime";

export interface PriceDataPoint {
  time: string;
  price: number;
}

export interface ChartDataState {
  chartData: Record<string, PriceDataPoint[]>;
}

export type ChartDataAction =
  | {
      type: "UPDATE_CHART_DATA";
      payload: { symbol: string; dataPoint: PriceDataPoint };
    }
  | { type: "REMOVE_CHART_DATA"; payload: string };

export interface ChartDataActions {
  getChartData: (symbol: string) => PriceDataPoint[];
  removeChartData: (symbol: string) => void;
}

export type SubscriptionAction =
  | { type: "SET_SUBSCRIPTIONS"; payload: string[] }
  | { type: "ADD_SUBSCRIPTION"; payload: string }
  | { type: "REMOVE_SUBSCRIPTION"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "INITIALIZE_SUBSCRIPTIONS"; payload: string[] };

export interface SubscriptionState {
  subscribedSymbols: string[];
  isLoading: boolean;
  error: string | null;
}

export interface SubscriptionActions {
  subscribeSymbol: (symbol: string) => Promise<boolean>;
  unsubscribeSymbol: (symbol: string) => Promise<boolean>;
  isSubscribed: (symbol: string) => boolean;
  initializeSubscriptions: () => Promise<void>;
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
