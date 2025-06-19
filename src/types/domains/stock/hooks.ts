import { RealtimeStockData } from "@/types/domains/realtime/entities";
import { StockCode } from "@/types/common/base";
import { ProcessedChartData } from "@/utils/dataProcessor";
import { SummaryData } from "@/components/features/stock/chart/PeriodPriceChartModel";

export interface StockCardDataResult {
  /** 실시간 주식 데이터 */
  readonly stockData: RealtimeStockData | null;

  /** 차트 데이터 */
  readonly chartData: ChartDataPoint[] | null;

  /** 가격 변화 시 깜빡임 효과 CSS 클래스 */
  readonly blinkClass: BlinkAnimationClass;

  /** 구독 해제 진행 중 여부 */
  readonly isUnsubscribing: boolean;

  /** 데이터 로딩 중 여부 */
  readonly isLoading: boolean;

  /** 에러 상태 */
  readonly error: StockCardError | null;

  /** 구독 해제 액션 */
  readonly handleUnsubscribe: () => Promise<void>;

  /** 데이터 새로고침 액션 */
  readonly handleRefresh: () => Promise<void>;

  /** 차트 기간 변경 액션 */
  readonly handlePeriodChange: (period: ChartPeriod) => Promise<void>;
}

/**
 * 차트 데이터 포인트
 */
export interface ChartDataPoint {
  /** 시각 (timestamp) */
  readonly time: string;

  /** 가격 */
  readonly price: number;

  /** 거래량 */
  readonly volume: number;

  /** 시가 (캔들차트용) */
  readonly open?: number;

  /** 고가 (캔들차트용) */
  readonly high?: number;

  /** 저가 (캔들차트용) */
  readonly low?: number;

  /** 종가 (캔들차트용) */
  readonly close?: number;
}

/**
 * 깜빡임 애니메이션 클래스
 */
export type BlinkAnimationClass = "" | "blink-up" | "blink-down";

/**
 * 차트 기간 타입
 */
export type ChartPeriod = "1m" | "5m" | "15m" | "30m" | "1h" | "1d";

/**
 * 주식 카드 에러 타입
 */
export interface StockCardError {
  /** 에러 코드 */
  readonly code: StockCardErrorCode;

  /** 에러 메시지 */
  readonly message: string;

  /** 에러 발생 시각 */
  readonly timestamp: string;

  /** 재시도 가능 여부 */
  readonly retryable: boolean;
}

/**
 * 주식 카드 에러 코드
 */
export type StockCardErrorCode =
  | "NETWORK_ERROR" // 네트워크 오류
  | "SUBSCRIPTION_FAILED" // 구독 실패
  | "UNSUBSCRIPTION_FAILED" // 구독 해제 실패
  | "DATA_FETCH_FAILED" // 데이터 조회 실패
  | "INVALID_STOCK_CODE" // 잘못된 종목 코드
  | "RATE_LIMIT_EXCEEDED" // API 호출 제한 초과
  | "UNAUTHORIZED" // 인증 오류
  | "UNKNOWN_ERROR"; // 알 수 없는 오류

/**
 * 주식 카드 훅 파라미터
 */
export interface UseStockCardDataParams {
  /** 종목 코드 */
  readonly symbol: StockCode;

  /** 초기 차트 기간 (기본값: "1d") */
  readonly initialPeriod?: ChartPeriod;

  /** 자동 새로고침 간격 (ms, 기본값: 1000) */
  readonly refreshInterval?: number;

  /** 에러 발생 시 재시도 횟수 (기본값: 3) */
  readonly maxRetries?: number;

  /** 컴포넌트 언마운트 시 자동 구독 해제 여부 (기본값: true) */
  readonly autoUnsubscribe?: boolean;
}

/**
 * 주식 카드 액션 타입
 */
export interface StockCardActions {
  /** 구독 해제 */
  unsubscribe: (symbol: StockCode) => Promise<void>;

  /** 데이터 새로고침 */
  refresh: (symbol: StockCode) => Promise<void>;

  /** 차트 기간 변경 */
  changePeriod: (symbol: StockCode, period: ChartPeriod) => Promise<void>;

  /** 에러 초기화 */
  clearError: (symbol: StockCode) => void;
}

export interface UsePeriodChartDataResult {
  processedData: ProcessedChartData | null;
  summaryData: SummaryData | null;
  hasValidData: boolean;
}

export interface OrderFormData {
  stockCode: string;
  orderType: string;
  quantity: string;
  price: string;
}

export interface UseStockOrderResult {
  isLoading: boolean;
  submitOrder: (orderData: OrderFormData) => Promise<boolean>;
  validateOrder: (orderData: OrderFormData) => {
    isValid: boolean;
    error?: string;
  };
}
