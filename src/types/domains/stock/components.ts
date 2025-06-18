import { PriceDataPoint } from "@/types/common/ui";

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

export interface PeriodChartProps {
  stockCode: string;
  stockName?: string;
}

export interface ChartData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockMiniChartProps {
  symbol: string;
  data: PriceDataPoint[];
  height?: number;
}

export interface SymbolInputFormProps {
  symbolInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string;
}
