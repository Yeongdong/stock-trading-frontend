export interface StockSearchResult {
  code: string;
  name: string;
  englishName?: string;
  sector: string;
  market: string;
}

export interface StockSearchSummary {
  totalStocks: number;
  kospiCount: number;
  kosdaqCount: number;
  konexCount: number;
  lastUpdated: string;
}

export interface StockSearchRequest {
  searchTerm: string;
  page?: number;
  pageSize?: number;
}

export interface StockSearchResponse {
  results: StockSearchResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
