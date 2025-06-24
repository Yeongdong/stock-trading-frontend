/**
 * 해외 주식 시장 타입
 */
export type OverseasMarket =
  | "nasdaq"
  | "nyse"
  | "tokyo"
  | "london"
  | "hongkong";

/**
 * 해외 주식 현재가 조회 요청
 */
export interface OverseasCurrentPriceRequest {
  stockCode: string;
  market: OverseasMarket;
}

/**
 * 해외 주식 현재가 조회 응답
 */
export interface OverseasCurrentPriceResponse {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  priceChange: number;
  changeRate: number;
  changeType: "rise" | "fall" | "steady";
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  currency: string;
  marketStatus: string;
  inquiryTime: Date;
}

/**
 * 해외 주식 정보
 */
export interface OverseasStockInfo {
  code: string;
  name: string;
  market: OverseasMarket;
  currency: string;
  sector?: string;
}

/**
 * 해외 주식 검색 요청
 */
export interface OverseasStockSearchRequest {
  market: OverseasMarket;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 해외 주식 검색 결과
 */
export interface OverseasStockSearchResult {
  code: string;
  name: string;
  market: OverseasMarket;
  currency: string;
  sector: string;
  currentPrice?: number;
  priceChange?: number;
  changeRate?: number;
}

/**
 * 해외 주식 검색 응답
 */
export interface OverseasStockSearchResponse {
  market: OverseasMarket;
  stocks: OverseasStockSearchResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 해외 시장 정보
 */
export interface OverseasMarketInfo {
  market: OverseasMarket;
  name: string;
  currency: string;
  timezone: string;
  tradingHours: {
    open: string;
    close: string;
  };
  isOpen: boolean;
}

/**
 * 해외 주식 차트 데이터
 */
export interface OverseasChartData {
  stockCode: string;
  market: OverseasMarket;
  period: string;
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

/**
 * 해외 시장 상수
 */
export const OVERSEAS_MARKETS: Record<OverseasMarket, OverseasMarketInfo> = {
  nasdaq: {
    market: "nasdaq",
    name: "나스닥",
    currency: "USD",
    timezone: "America/New_York",
    tradingHours: { open: "09:30", close: "16:00" },
    isOpen: false,
  },
  nyse: {
    market: "nyse",
    name: "뉴욕증권거래소",
    currency: "USD",
    timezone: "America/New_York",
    tradingHours: { open: "09:30", close: "16:00" },
    isOpen: false,
  },
  tokyo: {
    market: "tokyo",
    name: "도쿄증권거래소",
    currency: "JPY",
    timezone: "Asia/Tokyo",
    tradingHours: { open: "09:00", close: "15:00" },
    isOpen: false,
  },
  london: {
    market: "london",
    name: "런던증권거래소",
    currency: "GBP",
    timezone: "Europe/London",
    tradingHours: { open: "08:00", close: "16:30" },
    isOpen: false,
  },
  hongkong: {
    market: "hongkong",
    name: "홍콩증권거래소",
    currency: "HKD",
    timezone: "Asia/Hong_Kong",
    tradingHours: { open: "09:30", close: "16:00" },
    isOpen: false,
  },
} as const;

/**
 * 해외 주식 훅 관련 타입
 */
export interface UseOverseasStockResult {
  stockData: OverseasCurrentPriceResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentPrice: (request: OverseasCurrentPriceRequest) => Promise<void>;
  clearData: () => void;
}

export interface UseOverseasStockSearchResult {
  searchResults: OverseasStockSearchResult[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  searchStocks: (request: OverseasStockSearchRequest) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
}
