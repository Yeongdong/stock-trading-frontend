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
export interface OverseasOrderExecutionItem {
  ord_dt: string; // 주문일자
  ord_gno_brno: string; // 주문채번지점번호
  odno: string; // 주문번호
  orgn_odno: string; // 원주문번호
  sll_buy_dvsn_cd: string; // 매도매수구분코드
  sll_buy_dvsn_cd_name: string; // 매도매수구분코드명
  rvse_cncl_dvsn: string; // 정정취소구분
  rvse_cncl_dvsn_name: string; // 정정취소구분명
  pdno: string; // 상품번호
  prdt_name: string; // 상품명
  ft_ord_qty: string; // FT주문수량
  ft_ord_unpr3: string; // FT주문단가3
  ft_ccld_qty: string; // FT체결수량
  ft_ccld_unpr3: string; // FT체결단가3
  ft_ccld_amt3: string; // FT체결금액3
  nccs_qty: string; // 미체결수량
  prcs_stat_name: string; // 처리상태명
  rjct_rson: string; // 거부사유
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
