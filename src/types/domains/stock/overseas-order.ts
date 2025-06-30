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
  orderMode?: "immediate" | "scheduled";
  scheduledExecutionTime?: string;
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
export interface OverseasOrderExecutionItem {
  ord_dt: string; // 주문일자
  ord_gno_brno: string; // 주문채번지점번호
  odno: string; // 주문번호
  orgn_odno: string; // 원주문번호
  sll_buy_dvsn_cd: string; // 매도매수구분코드
  sll_buy_dvsn_cd_name: string; // 매도매수구분코드명
  rvse_cncl_dvsn: string; // 정정취소구분
  rvse_cncl_dvsn_name: string; // 정정취소구분명
  pdno: string; // 상품번호 (종목코드)
  prdt_name: string; // 상품명
  ft_ord_qty: string; // FT주문수량
  ft_ord_unpr3: string; // FT주문단가3
  ft_ccld_qty: string; // FT체결수량
  ft_ccld_unpr3: string; // FT체결단가3
  ft_ccld_amt3: string; // FT체결금액3
  nccs_qty: string; // 미체결수량
  prcs_stat_name: string; // 처리상태명
  rjct_rson: string; // 거부사유
  rjct_rson_name: string; // 거부사유명
  ord_tmd: string; // 주문시각
  tr_mket_name: string; // 거래시장명
  tr_natn: string; // 거래국가
  tr_natn_name: string; // 거래국가명
  ovrs_excg_cd: string; // 해외거래소코드
  tr_crcy_cd: string; // 거래통화코드
  dmst_ord_dt: string; // 국내주문일자
  thco_ord_tmd: string; // 당사주문시각
  loan_type_cd: string; // 대출유형코드
  loan_dt: string; // 대출일자
  mdia_dvsn_name: string; // 매체구분명
  usa_amk_exts_rqst_yn: string; // 미국애프터마켓연장신청여부
  splt_buy_attr_name: string; // 분할매수/매도속성명
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
  orderMode: "immediate" | "scheduled";
  scheduledExecutionTime?: string;
}

/**
 * 시장별 거래소 코드 매핑
 */
export const MARKET_TO_EXCHANGE_CODE: Record<OverseasMarket, string> = {
  nas: "NASD",
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

/**
 * 주문 모드 옵션
 */
export const ORDER_MODE_OPTIONS = [
  { value: "immediate" as const, label: "즉시 주문" },
  { value: "scheduled" as const, label: "예약 주문" },
] as const;

/**
 * 시장별 예약주문 안내 메시지
 */
export const getScheduledOrderGuide = (exchangeCode: string): string => {
  switch (exchangeCode) {
    case "NASD":
    case "NYSE":
    case "AMEX":
      return "미국 예약주문: 10:00-23:20 접수 (서머타임 시 22:20), 23:30 정규장 전송";
    case "SEHK":
      return "홍콩 예약주문: 09:00-10:20, 10:40-13:50 접수";
    case "TKSE":
      return "일본 예약주문: 09:10-12:20 접수, 12:30 주문전송";
    case "SHAA":
    case "SZAA":
      return "중국 예약주문: 09:00-10:20, 10:40-13:50 접수";
    case "HASE":
    case "VNSE":
      return "베트남 예약주문: 09:00-11:00, 11:20-14:50 접수";
    default:
      return "예약주문은 해당 시장의 운영시간에 따라 자동 처리됩니다.";
  }
};

/**
 * 거래소별 시장명 반환
 */
export const getMarketName = (exchangeCode: string): string => {
  switch (exchangeCode) {
    case "NASD":
      return "나스닥";
    case "NYSE":
      return "뉴욕증권거래소";
    case "AMEX":
      return "아멕스";
    case "SEHK":
      return "홍콩증권거래소";
    case "TKSE":
      return "도쿄증권거래소";
    case "SHAA":
      return "상해증권거래소";
    case "SZAA":
      return "심천증권거래소";
    case "HASE":
      return "하노이증권거래소";
    case "VNSE":
      return "호치민증권거래소";
    default:
      return "해외증권거래소";
  }
};
