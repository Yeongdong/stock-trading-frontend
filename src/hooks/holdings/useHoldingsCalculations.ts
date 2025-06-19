import { useMemo } from "react";
import { Position } from "@/types/domains/stock/balance";
import { HoldingItem } from "@/types";

export const useHoldingsCalculations = (positions: Position[]) => {
  return useMemo(() => {
    if (!positions || positions.length === 0) return [];

    const holdingsWithCalculations: HoldingItem[] = positions
      .filter((position) => {
        // 유효한 데이터만 필터링
        const currentPrice = parseFloat(position.prpr);
        const avgPrice = parseFloat(position.pchs_avg_pric);
        const quantity = parseFloat(position.hldg_qty);

        return (
          !isNaN(currentPrice) &&
          !isNaN(avgPrice) &&
          !isNaN(quantity) &&
          currentPrice >= 0 &&
          avgPrice >= 0 &&
          quantity >= 0
        );
      })
      .map((position) => {
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
      });

    // TOP 5 추출
    return holdingsWithCalculations
      .sort((a, b) => {
        const aAmount = parseFloat(a.evlu_amt) || 0;
        const bAmount = parseFloat(b.evlu_amt) || 0;
        return bAmount - aAmount;
      })
      .slice(0, 5);
  }, [positions]);
};
