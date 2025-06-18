import { StockCode } from "@/types/common/base";
import { StockData } from "./entities";

export interface StockDataState {
  readonly stockData: Record<StockCode, StockData>;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export type StockDataAction =
  | { type: "SET_STOCK_DATA"; payload: Record<StockCode, StockData> }
  | {
      type: "UPDATE_STOCK_DATA";
      payload: { symbol: StockCode; data: StockData };
    }
  | { type: "REMOVE_STOCK_DATA"; payload: StockCode }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };
