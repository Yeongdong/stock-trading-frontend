import { StockData, PricePoint, StockCode } from "./stock";

export interface AsyncState<T = void> {
  readonly data?: T;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export interface StockDataState {
  readonly stockData: Record<StockCode, StockData>;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export type StockDataAction =
  | { type: "SET_STOCK_DATA"; payload: Record<StockCode, StockData> }
  | {
      type: "UPDATE_STOCK_DATA";
      payload: { symbol: StockCode; data: StockData };
    }
  | { type: "REMOVE_STOCK_DATA"; payload: StockCode }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

export interface ChartDataState {
  readonly [symbol: StockCode]: PricePoint[];
}

export type ChartDataAction =
  | {
      type: "UPDATE_CHART_DATA";
      payload: { symbol: StockCode; point: PricePoint };
    }
  | { type: "REMOVE_CHART_DATA"; payload: StockCode }
  | { type: "CLEAR_ALL_CHART_DATA" };

export interface SubscriptionState {
  readonly subscribedSymbols: StockCode[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

export type SubscriptionAction =
  | { type: "SET_SUBSCRIPTIONS"; payload: StockCode[] }
  | { type: "ADD_SUBSCRIPTION"; payload: StockCode }
  | { type: "REMOVE_SUBSCRIPTION"; payload: StockCode }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

export interface RealtimeState {
  readonly stockData: Record<StockCode, StockData>;
  readonly isConnected: boolean;
  readonly error: string | null;
}

export type RealtimeAction =
  | {
      type: "UPDATE_STOCK_DATA";
      payload: { symbol: StockCode; data: StockData };
    }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "REMOVE_STOCK_DATA"; payload: StockCode };
