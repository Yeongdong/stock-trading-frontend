export interface StockBalance {
  summary: BalanceSummary;
  positions: StockPosition[];
}

export interface BalanceSummary {
  totalDeposit: string;
  stockEvaluation: string;
  totalEvaluation: string;
  profitLoss: string;
  profitLossRate: number;
}

export interface StockPosition {
  pdno: string; // 상품번호 (종목코드)
  prdt_name: string; // 상품명
  hldg_qty: string; // 보유수량
  pchs_avg_pric: string; // 매입평균가격
  prpr: string; // 현재가
  evlu_amt: string; // 평가금액
  evlu_pfls_amt: string; // 평가손익금액
  evlu_pfls_rt: string; // 평가손익율
  profitLossAmount: number;
  profitLossRate: number;
}

export interface StockOrder {
  acntPrdtCd: string; // 계좌상품코드
  trId: string; // 거래ID
  pdno: string; // 상품번호
  ordDvsn: string; // 주문구분
  ordQty: string; // 주문수량
  ordUnpr: string; // 주문단가
}
