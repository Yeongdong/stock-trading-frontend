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

export interface StockCardSkeletonProps {
  symbol: string;
}

export interface ChartInfoProps {
  startPrice: number;
  currentPrice: number;
  priceChangePercentage: number;
  priceChangeClass: string;
}

export interface ChartRendererProps {
  data: PriceDataPoint[];
  yDomain: [number, number];
  startPrice: number;
  lineColor: string;
  height: number;
}

export interface SymbolInputFormProps {
  symbolInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string;
}
