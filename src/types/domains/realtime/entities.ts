import {
  StockCode,
  Money,
  Quantity,
  Percentage,
  PriceDirection,
  MarketType,
} from "@/types/common/base";

export interface RealtimeStockData {
  readonly symbol: StockCode;
  readonly name: string;
  readonly price: Money;
  readonly priceChange: Money;
  readonly changeRate: Percentage;
  readonly changeDirection: PriceDirection;
  readonly volume: Quantity;
  readonly openPrice: Money;
  readonly highPrice: Money;
  readonly lowPrice: Money;
  readonly previousClosePrice: Money;
  readonly timestamp: string;
  readonly marketType: MarketType;
  readonly bidPrice?: Money;
  readonly askPrice?: Money;
  readonly bidQuantity?: Quantity;
  readonly askQuantity?: Quantity;
}

export interface RealtimeSubscription {
  readonly code: StockCode;
  readonly subscribedAt: string;
  readonly lastUpdatedAt?: string;
  readonly status: SubscriptionStatus;
}

export type SubscriptionStatus = "active" | "paused" | "error" | "disconnected";

export type RealtimeStockDataMap = Record<StockCode, RealtimeStockData>;

export interface SubscriptionsResponse {
  readonly symbols: StockCode[];
  readonly timestamp: string;
}

export interface DashboardStateResult {
  isLoading: boolean;
  hasSubscriptions: boolean;
  showLoading: boolean;
  showEmptyState: boolean;
  subscribedSymbols: string[];
}

export interface ConnectionData {
  connectionId: string;
}

export interface TradeExecutionData {
  OrderId: string;
  StockCode: string;
  Quantity: number;
  Price: number;
  ExecutionTime: string;
  Status: string;
}

export interface EventDataMap {
  stockPrice: RealtimeStockData;
  tradeExecution: TradeExecutionData;
  connected: ConnectionData;
}

export type EventTypes = keyof EventDataMap;

export type ErrorInfo = {
  message: string;
  code?: string;
};
