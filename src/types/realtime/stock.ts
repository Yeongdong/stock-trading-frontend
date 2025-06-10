export interface RealtimeStockData {
  symbol: string; // 종목코드
  price: number; // 체결가격
  volume: number; // 체결수량
  transactionTime: string; // 체결시간 (ISO 문자열)
  priceChange: number; // 전일대비
  changeType: string; // 등락구분 (상승/하락)
  changeRate: number; // 등락률
  totalVolume: number; // 누적거래량
  openPrice: number; // 시가
  highPrice: number; // 고가
  lowPrice: number; // 저가
  stockName?: string; // 종목명 (선택적)
}

export interface PriceDataPoint {
  time: string;
  price: number;
}
