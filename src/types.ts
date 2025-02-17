export interface Position {
  stockCode: string;
  stockName: string;
  quantity: string;
  averagePrice: string;
  currentPrice: string;
  profitLoss: string;
  profitLossRate: string;
}

export interface Summary {
  totalDeposit: string;
  stockEvaluation: string;
  totalEvaluation: string;
}

export interface StockBalance {
  positions: Position[];
  summary: Summary;
}

export interface StockOrder {
  acntPrdtCd: string; // 계좌상품코드
  trId: string; // 거래ID
  pdno: string; // 종목코드
  orderDvsn: string; // 주문구분
  ordQty: string; // 주문수량
  ordUnpr: string; // 주문단가
}
