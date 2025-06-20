import { PriceDataPoint } from "@/types/common/ui";
import { PeriodPriceRequest } from "./price";
import { SummaryData } from "@/components/features/stock/chart/PeriodPriceChartModel";
import { StockSearchResult } from "./search";
import { UseStockSearchResult } from "./hooks";

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

export interface StockSearchResultsProps {
  onStockSelect: (stock: StockSearchResult) => void;
}

export interface StockSearchViewProps {
  onStockSelect: (stock: StockSearchResult) => void;
}

export interface BuyableInquiryProps {
  selectedStockCode?: string;
  onOrderRequest?: (
    stockCode: string,
    orderPrice: number,
    maxQuantity: number
  ) => void;
}

export interface StockSearchFormProps {
  stockSearchHook: UseStockSearchResult;
}

export interface StockSearchResultsWithHookProps
  extends StockSearchResultsProps {
  stockSearchHook: UseStockSearchResult;
}
