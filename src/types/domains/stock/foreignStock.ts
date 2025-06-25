/**
 * Finnhub API 기반 해외주식 검색 타입
 */
export interface ForeignStockSearchRequest {
  query: string;
  exchange?: string;
  limit?: number;
}

export interface ForeignStockInfo {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
  currency: string;
  exchange: string;
  country: string;
}

export interface ForeignStockSearchResult {
  stocks: ForeignStockInfo[];
  count: number;
}
