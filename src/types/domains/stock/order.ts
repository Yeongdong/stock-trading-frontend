export interface StockOrder {
  acntPrdtCd: string; // 계좌상품코드
  trId: string; // 거래ID
  pdno: string; // 종목코드
  ordDvsn: string; // 주문구분
  ordQty: string; // 주문수량
  ordUnpr: string; // 주문단가
}

export interface StockInfo {
  code: string;
  name: string;
}
