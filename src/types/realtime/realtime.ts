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

// 실시간 데이터
export interface StockPriceSubscriber {
  (data: StockTransaction): void;
}

export interface TradeExecutionData {
  OrderId: string;
  StockCode: string;
  Quantity: number;
  Price: number;
  ExecutionTime: string;
  Status: string;
}

export interface ConnectionData {
  connectionId: string;
}

export interface EventDataMap {
  stockPrice: StockTransaction;
  tradeExecution: TradeExecutionData;
  connected: ConnectionData;
}

export type EventTypes = keyof EventDataMap;

export type ErrorInfo = {
  message: string;
  code?: string;
};
