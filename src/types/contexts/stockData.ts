import { RealtimeStockData, PriceDataPoint } from "../realtime/stock";

export interface ChartDataState {
  [symbol: string]: PriceDataPoint[];
}

export type ChartDataAction =
  | {
      type: "UPDATE_CHART_DATA";
      payload: { symbol: string; dataPoint: PriceDataPoint };
    }
  | { type: "REMOVE_CHART_DATA"; payload: string }
  | { type: "CLEAR_ALL_CHART_DATA" };

export interface ChartDataContextType {
  chartData: ChartDataState;
  updateChartData: (stockData: RealtimeStockData) => void;
  removeChartData: (symbol: string) => void;
  clearAllChartData: () => void;
  getChartData: (symbol: string) => PriceDataPoint[];
}

export interface SubscriptionState {
  subscribedSymbols: string[];
  isLoading: boolean;
  error: string | null;
}

export type SubscriptionAction =
  | { type: "SET_SUBSCRIPTIONS"; payload: string[] }
  | { type: "ADD_SUBSCRIPTION"; payload: string }
  | { type: "REMOVE_SUBSCRIPTION"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

export interface SubscriptionContextType {
  subscribedSymbols: string[];
  isLoading: boolean;
  error: string | null;
  subscribeSymbol: (symbol: string) => Promise<boolean>;
  unsubscribeSymbol: (symbol: string) => Promise<boolean>;
  isSubscribed: (symbol: string) => boolean;
}

export interface StockDataState {
  stockData: Record<string, RealtimeStockData>;
  isLoading: boolean;
  error: string | null;
}

export type StockDataAction =
  | { type: "SET_STOCK_DATA"; payload: Record<string, RealtimeStockData> }
  | {
      type: "UPDATE_STOCK_DATA";
      payload: { symbol: string; data: RealtimeStockData };
    }
  | { type: "REMOVE_STOCK_DATA"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

export interface StockDataContextType {
  stockData: Record<string, RealtimeStockData>;
  isLoading: boolean;
  error: string | null;
  updateStockData: (symbol: string, data: RealtimeStockData) => void;
  removeStockData: (symbol: string) => void;
  getStockData: (symbol: string) => RealtimeStockData | null;
}

export interface StockCardDataResult {
  stockData: RealtimeStockData | null;
  chartData: PriceDataPoint[];
  blinkClass: string;
  isUnsubscribing: boolean;
  isLoading: boolean;
  handleUnsubscribe: () => Promise<void>;
}

export interface ChartCalculationResult {
  hasData: boolean;
  yDomain: [number, number];
  startPrice: number;
  currentPrice: number;
  lineColor: string;
  priceChangePercentage: number;
  priceChangeClass: string;
}

export interface SymbolSubscriptionResult {
  symbolInput: string;
  setSymbolInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  error: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubscribe: (e: React.FormEvent) => Promise<void>;
  validateSymbol: (symbol: string) => boolean;
}
