import { PriceDataPoint } from "../contexts";
export interface StockPriceCardProps {
  symbol: string;
}

export interface PriceDisplayProps {
  price: number;
  priceChange: number;
  changeRate: number;
  className?: string;
}

export interface StockMiniChartProps {
  symbol: string;
  data: PriceDataPoint[];
  height?: number;
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
