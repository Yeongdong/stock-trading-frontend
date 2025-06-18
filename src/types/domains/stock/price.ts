export interface CurrentPriceRequest {
  stockCode: string;
}

export interface CurrentPriceResponse {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  priceChange: number;
  changeRate: number;
  changeType: string; // "상승" | "하락" | "보합"
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  inquiryTime: string;
}

// 기간별 시세 조회 요청 타입
export interface PeriodPriceRequest {
  stockCode: string;
  periodDivCode: "D" | "W" | "M" | "Y";
  startDate: string;
  endDate: string;
  orgAdjPrc?: "0" | "1";
  marketDivCode?: "J" | "NX" | "UN"; // J:KRX, NX:NXT, UN:통합
}

// 기간별 시세 조회 응답 타입
export interface PeriodPriceResponse {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  priceChange: number;
  changeRate: number;
  changeSign: string;
  totalVolume: number;
  totalTradingValue: number;
  priceData: PeriodPriceData[];
}

// 기간별 시세 데이터 타입
export interface PeriodPriceData {
  date: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
  tradingValue: number;
  priceChange: number;
  changeSign: string;
  flagCode: string;
  splitRate: number;
}

// 기간 구분 옵션
export const PERIOD_OPTIONS = [
  { value: "D", label: "일봉" },
  { value: "W", label: "주봉" },
  { value: "M", label: "월봉" },
  { value: "Y", label: "년봉" },
] as const;
