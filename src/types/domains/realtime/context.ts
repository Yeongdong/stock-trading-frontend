import { PriceDataPoint } from "@/types/common/ui";
import { RealtimeStockData } from "./entities";
import { StockCode } from "@/types/common/base";

export interface ChartDataState {
  readonly [symbol: string]: PriceDataPoint[];
}

export type ChartDataAction =
  | {
      readonly type: "UPDATE_CHART_DATA";
      readonly payload: {
        readonly symbol: string;
        readonly dataPoint: PriceDataPoint;
      };
    }
  | {
      readonly type: "REMOVE_CHART_DATA";
      readonly payload: string;
    }
  | {
      readonly type: "CLEAR_ALL_CHART_DATA";
    };

export interface ChartDataContextType {
  readonly chartData: ChartDataState;
  readonly updateChartData: (stockData: RealtimeStockData) => void;
  readonly removeChartData: (symbol: string) => void;
  readonly clearAllChartData: () => void;
  readonly getChartData: (symbol: string) => PriceDataPoint[];
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

export interface RealtimeState {
  readonly stockData: Record<StockCode, RealtimeStockData>;
  readonly isConnected: boolean;
  readonly error: string | null;
}

export type RealtimeAction =
  | {
      type: "UPDATE_STOCK_DATA";
      payload: { symbol: StockCode; data: RealtimeStockData };
    }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "REMOVE_STOCK_DATA"; payload: StockCode };

// 구독 상태
export interface SubscriptionState {
  readonly subscribedSymbols: ReadonlyArray<string>;
  readonly isLoading: boolean;
  readonly error: string | null;
}

// 구독 액션
export type SubscriptionAction =
  | {
      readonly type: "SET_SUBSCRIPTIONS";
      readonly payload: ReadonlyArray<string>;
    }
  | {
      readonly type: "ADD_SUBSCRIPTION";
      readonly payload: string;
    }
  | {
      readonly type: "REMOVE_SUBSCRIPTION";
      readonly payload: string;
    }
  | {
      readonly type: "SET_LOADING";
      readonly payload: boolean;
    }
  | {
      readonly type: "SET_ERROR";
      readonly payload: string | null;
    };

// 구독 컨텍스트 타입
export interface SubscriptionContextType {
  readonly subscribedSymbols: ReadonlyArray<string>;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly subscribeSymbol: (symbol: string) => Promise<boolean>;
  readonly unsubscribeSymbol: (symbol: string) => Promise<boolean>;
  readonly isSubscribed: (symbol: string) => boolean;
  readonly clearAllSubscriptions: () => Promise<boolean>;
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

export interface RealtimePriceContextType {
  readonly stockData: Record<StockCode, RealtimeStockData>;
  readonly isConnected: boolean;
  readonly error: string | null;
  readonly getStockData: (symbol: StockCode) => RealtimeStockData | null;
  readonly removeStockData: (symbol: StockCode) => void;
}

export interface RealtimeCallbacks {
  readonly onStockDataUpdate?: (data: RealtimeStockData) => void;
  readonly onChartDataUpdate?: (data: RealtimeStockData) => void;
}
