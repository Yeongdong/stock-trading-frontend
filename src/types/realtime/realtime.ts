import { StockTransaction } from "../contexts";

export interface TradeExecutionData {
  OrderId: string;
  StockCode: string;
  Quantity: number;
  Price: number;
  ExecutionTime: string;
  Status: string;
}

export interface ConnectionData {
  connectionId: string;
}

export interface EventDataMap {
  stockPrice: StockTransaction;
  tradeExecution: TradeExecutionData;
  connected: ConnectionData;
}

export type EventTypes = keyof EventDataMap;

export type ErrorInfo = {
  message: string;
  code?: string;
};

export type RealtimePriceAction =
  | {
      type: "UPDATE_STOCK_DATA";
      payload: { symbol: string; data: StockTransaction };
    }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "REMOVE_STOCK_DATA"; payload: string };

export interface RealtimePriceState {
  stockData: Record<string, StockTransaction>;
  isConnected: boolean;
  error: string | null;
}

export interface RealtimePriceActions {
  getStockData: (symbol: string) => StockTransaction | null;
  removeStockData: (symbol: string) => void;
}

export interface DashboardStateResult {
  isLoading: boolean;
  error: string | null;
  hasSubscriptions: boolean;
  showLoading: boolean;
  showEmptyState: boolean;
  subscribedSymbols: string[];
}
