import { StockBalance, Position, Summary } from "@/types";

export interface AccountBalanceViewProps {
  balanceData: StockBalance | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export interface KisTokenFormProps {
  userId?: number;
}

export interface PositionsTableProps {
  positions: Position[];
}

export interface SummaryCardsProps {
  summary: Summary;
}
