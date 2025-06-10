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

export interface KisTransactionInfo {
  symbol: string; // 종목코드
  price: number; // 체결가격
  volume: number; // 체결수량
  transactionTime: string; // 체결시간 (ISO 문자열)
  priceChange: number; // 전일대비
  changeType: string; // 등락구분 (상승/하락)
  changeRate: number; // 등락률
  totalVolume: number; // 누적거래량
  openPrice: number; // 시가
  highPrice: number; // 고가
  lowPrice: number; // 저가
}
