export interface DashboardHeaderProps {
  title: string;
}

export interface EmptySubscriptionStateProps {
  message?: string;
  submessage?: string;
}

export interface PriceDisplayProps {
  price: number;
  priceChange: number;
  changeRate: number;
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
  symbols: string[];
}

export interface StockPriceCardProps {
  symbol: string;
}
