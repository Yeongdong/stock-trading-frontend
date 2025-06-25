/**
 * 해외 주식 잔고 포지션
 */
export interface OverseasBalancePosition {
  stockCode: string; // ovrs_pdno
  stockName: string; // ovrs_item_name
  exchangeCode: string; // ovrs_excg_cd
  quantity: string; // ovrs_cblc_qty
  averagePrice: string; // pchs_avg_pric
  currentPrice: string; // now_pric2
  purchaseAmount: string; // frcr_pchs_amt1
  evaluationAmount: string; // ovrs_stck_evlu_amt
  profitLoss: string; // frcr_evlu_pfls_amt
  profitLossRate: string; // evlu_pfls_rt
  currencyCode: string; // tr_crcy_cd
  orderableQuantity: string; // ord_psbl_qty
  loanTypeCode: string; // loan_type_cd
  loanDate: string; // loan_dt
  expiryDate: string; // expd_dt
}

/**
 * 해외 주식 계좌 잔고
 */
export interface OverseasAccountBalance {
  positions: OverseasBalancePosition[];
  totalPositions: number;
  hasPositions: boolean;
  depositInfo: OverseasDepositInfo;
}

/**
 * 해외 예수금 정보
 */
export interface OverseasDepositInfo {
  totalDepositAmount: number;
  orderableAmount: number;
  currencyCode: string;
  exchangeRate: number;
  totalDepositAmountKrw: number;
  inquiryTime: string;
}

/**
 * 해외 잔고 훅 결과
 */
export interface UseOverseasBalanceResult {
  balance: OverseasAccountBalance | null;
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  clearBalance: () => void;
}
