import { useMemo } from "react";
import { Position } from "@/types/domains/stock/balance";
import { HoldingItem } from "@/types";

export const useHoldingsCalculations = (positions: Position[]) => {
  return useMemo(() => {
    if (!positions || positions.length === 0) return [];

    const holdingsWithCalculations: HoldingItem[] = positions.map(
      (position) => {
        const currentPrice = parseFloat(position.prpr);
        const avgPrice = parseFloat(position.pchs_avg_pric);
        const quantity = parseFloat(position.hldg_qty);

        const profitLossRate =
          avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

        const profitLossAmount = (currentPrice - avgPrice) * quantity;

        return {
          ...position,
          profitLossRate,
          profitLossAmount,
        };
      }
    );

    // 평가금액 기준으로 내림차순 정렬하여 TOP 5 추출
    const topHoldings = holdingsWithCalculations
      .sort((a, b) => parseFloat(b.evlu_amt) - parseFloat(a.evlu_amt))
      .slice(0, 5);

    return topHoldings;
  }, [positions]);
};
