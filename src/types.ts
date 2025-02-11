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
