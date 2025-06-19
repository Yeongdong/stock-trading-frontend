import { StockCode } from "@/types/common/base";
import { RealtimeStockData } from "../realtime/entities";

// 주식 데이터 상태
export interface StockDataState {
  readonly stockData: Record<StockCode, RealtimeStockData>;
  readonly isLoading: boolean;
  readonly error: string | null;
}

// 주식 데이터 액션
export type StockDataAction =
  | {
      readonly type: "SET_STOCK_DATA";
      readonly payload: Record<StockCode, RealtimeStockData>;
    }
  | {
      readonly type: "UPDATE_STOCK_DATA";
      readonly payload: {
        readonly symbol: StockCode;
        readonly data: RealtimeStockData;
      };
    }
  | {
      readonly type: "REMOVE_STOCK_DATA";
      readonly payload: StockCode;
    }
  | {
      readonly type: "SET_LOADING";
      readonly payload: boolean;
    }
  | {
      readonly type: "SET_ERROR";
      readonly payload: string | null;
    };

// 주식 데이터 Context 타입
export interface StockDataContextType {
  readonly stockData: Record<StockCode, RealtimeStockData>;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly updateStockData: (stockData: RealtimeStockData) => void;
  readonly removeStockData: (symbol: StockCode) => void;
  readonly getStockData: (symbol: StockCode) => RealtimeStockData | null;
  readonly clearAllStockData: () => void;
}

export interface StockDataContextValue {
  readonly stockData: Record<StockCode, RealtimeStockData>;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly updateStockData: (stockData: RealtimeStockData) => void;
  readonly removeStockData: (symbol: StockCode) => void;
  readonly getStockData: (symbol: StockCode) => RealtimeStockData | null;
  readonly clearAllStockData: () => void;
}
