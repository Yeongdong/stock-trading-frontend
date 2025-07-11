export interface DashboardHeaderProps {
  title: string;
}

export interface EmptySubscriptionStateProps {
  message?: string;
  submessage?: string;
}

export interface RealtimeDashboardProps {
  readonly title?: string;
}

export interface PriceDisplayProps {
  symbol: string;
  className?: string;
}

export interface StockPriceHeaderProps {
  symbol: string;
  name?: string;
  isUnsubscribing: boolean;
  onUnsubscribe: () => void;
}

export interface TradingInfoProps {
  volume: number;
  time: string;
}

export interface StockCardSkeletonProps {
  symbol: string;
}

export interface StockGridProps {
  symbols: readonly string[];
}

export interface StockPriceCardProps {
  symbol: string;
}
