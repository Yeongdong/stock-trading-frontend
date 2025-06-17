export interface StockData {
  readonly code: string;
  readonly name?: string;
  readonly price: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly volume: number;
  readonly totalVolume: number;
  readonly priceChange: number;
  readonly changeRate: number;
  readonly changeDirection: "UP" | "DOWN" | "FLAT";
  readonly timestamp: string;
}

export interface PricePoint {
  readonly time: string;
  readonly price: number;
}

export type StockCode = string;
export type StockDataMap = Record<StockCode, StockData>;
export type ChartDataMap = Record<StockCode, PricePoint[]>;
