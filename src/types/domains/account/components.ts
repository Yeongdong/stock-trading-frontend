import { Balance, Position, Summary } from "../stock";

export interface AccountBalanceViewProps {
  balanceData: Balance | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export interface AccountBalanceViewProps {
  balanceData: Balance | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export interface KisTokenFormProps {
  userId?: string;
}

export interface PositionsTableProps {
  positions: Position[];
}

export interface SummaryCardsProps {
  summary: Summary;
}

export interface HoldingsOverviewProps {
  positions?: Position[];
  isLoading: boolean;
}

export interface MarketStatus {
  isOpen: boolean;
  statusText: string;
  statusIcon: string;
}
