export interface StockCardSkeletonProps {
  symbol: string;
}

export interface ChartInfoProps {
  startPrice: number;
  currentPrice: number;
  priceChangePercentage: number;
  priceChangeClass: string;
}

export interface StockGridProps {
  symbols: string[];
}
