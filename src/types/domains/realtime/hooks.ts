import { PriceDataPoint } from "@/types/common/ui";
import { RealtimeStockData } from "./entities";

export interface RealtimeDashboardState {
  readonly subscribedSymbols: readonly string[];
  readonly isLoading: boolean;
  readonly hasSubscriptions: boolean;
  readonly showEmptyState: boolean;
}

export interface RealtimeCardDataResult {
  readonly stockData: RealtimeStockData | null;
  readonly chartData: PriceDataPoint[] | null;
  readonly blinkClass: string;
  readonly isUnsubscribing: boolean;
  readonly isLoading: boolean;
  readonly handleUnsubscribe: () => Promise<void>;
}
