import { OverseasMarket } from "./overseas";

/**
 * 해외 주식 주문 요청
 */
export interface OverseasStockOrder {
  acntPrdtCd: string; // 계좌상품코드
  trId: string; // 거래ID (VTTT1002U: 매수, VTTT1001U: 매도)
  pdno: string; // 종목코드
  ordDvsn: string; // 주문구분 (00: 지정가, 01: 시장가)
  ordQty: string; // 주문수량
  ordUnpr: string; // 주문단가
  ovsExcgCd: string; // 해외거래소코드 (NASD, NYSE, TKSE, LNSE, HKEX)
  ordCndt: string; // 주문조건 (DAY, FTC)
}

/**
 * 해외 주식 주문 응답
 */
export interface OverseasOrderResponse {
  orderNumber: string;
  orderTime: string;
  stockCode: string;
  stockName: string;
  market: OverseasMarket;
  tradeType: string;
  orderDivision: string;
  quantity: number;
  price: number;
  orderCondition: string;
  currency: string;
  orderStatus: string;
  isSuccess: boolean;
  message?: string;
}

/**
 * 해외 주식 주문 체결 내역
 */
export interface OverseasOrderExecution {
  executionNumber: string;
  orderNumber: string;
  executionTime: Date;
  stockCode: string;
  stockName: string;
  market: OverseasMarket;
  tradeType: string;
  executedQuantity: number;
  executedPrice: number;
  executedAmount: number;
  currency: string;
  commission: number;
  tax: number;
  exchangeRate: number;
}

/**
 * 해외 주식 주문 폼 데이터
 */
export interface OverseasOrderFormData {
  pdno: string;
  ovsExcgCd: string;
  trId: "VTTT1002U" | "VTTT1001U";
  ordDvsn: "00" | "01";
  ordQty: string;
  ordUnpr: string;
  ordCndt: "DAY" | "FTC";
}

/**
 * 시장별 거래소 코드 매핑
 */
export const MARKET_TO_EXCHANGE_CODE: Record<OverseasMarket, string> = {
  nasdaq: "NASD",
  nyse: "NYSE",
  tokyo: "TKSE",
  london: "LNSE",
  hongkong: "HKEX",
} as const;

/**
 * 거래 타입 옵션
 */
export const OVERSEAS_TRADE_TYPES = [
  { value: "VTTT1002U", label: "매수", color: "buy" },
  { value: "VTTT1001U", label: "매도", color: "sell" },
] as const;

/**
 * 주문 구분 옵션
 */
export const OVERSEAS_ORDER_DIVISIONS = [
  { value: "00", label: "지정가", requiresPrice: true },
  { value: "01", label: "시장가", requiresPrice: false },
] as const;

/**
 * 주문 조건 옵션
 */
export const OVERSEAS_ORDER_CONDITIONS = [
  { value: "DAY", label: "당일" },
  { value: "FTC", label: "Fill or Kill" },
] as const;
