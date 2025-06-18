import { Position } from "../stock";

export interface HoldingItem extends Position {
  profitLossRate: number;
  profitLossAmount: number;
}
