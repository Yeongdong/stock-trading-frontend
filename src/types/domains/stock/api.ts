export interface CurrentPriceRequest {
  stockCode: string;
}

export interface CurrentPriceResponse {
  currentPrice: number;
  change: number;
  changeRate: number;
  volume: number;
  timestamp: string;
}

export interface PeriodPriceRequest {
  stockCode: string;
  periodDivCode: string; // D, W, M
  startDate: string;
  endDate: string;
  orgAdjPrc?: string;
  marketDivCode?: string;
}

export interface PeriodPriceResponse {
  stockCode: string;
  data: PeriodPriceData[];
}

export interface PeriodPriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockSearchRequest {
  searchTerm: string;
  page?: number;
  pageSize?: number;
}

export interface StockSearchResult {
  code: string;
  name: string;
  market: string;
  sector?: string;
  currentPrice?: number;
  changeRate?: number;
}

export interface StockSearchSummary {
  totalCount: number;
  categories: string[];
  popularStocks: string[];
}
