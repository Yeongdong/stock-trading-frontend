import { PriceDataPoint } from "@/types/common/ui";
import { PeriodPriceRequest } from "./price";
import { SummaryData } from "@/components/features/stock/chart/PeriodPriceChartModel";

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
  data: PriceDataPoint[] | null;
  height?: number;
}

export interface SymbolInputFormProps {
  symbolInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string;
}

export interface PeriodPriceFormProps {
  initialData: PeriodPriceRequest;
  loading: boolean;
  onSubmit: (data: PeriodPriceRequest) => Promise<void>;
}

export interface PeriodPriceSummaryProps {
  summaryData: SummaryData;
}

export interface OrderFormState {
  stockCode: string;
  orderType: string;
  quantity: string;
  price: string;
}
