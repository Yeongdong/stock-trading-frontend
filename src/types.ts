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
  ordDvsn: string; // 주문구분
  ordQty: string; // 주문수량
  ordUnpr: string; // 주문단가
}

export interface StockTransaction {
  symbol: string; // 종목코드
  price: number; // 현재가격
  priceChange: number; // 전일대비 변동폭
  changeType: string; // 등락구분 (상승/하락)
  changeRate: number; // 변동률
  volume: number; // 거래량
  totalVolume: number; // 누적거래량
  transactionTime: string; // 거래시간
}
