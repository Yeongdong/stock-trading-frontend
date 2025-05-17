import React, { memo } from "react";
import { StockMiniChartProps } from "@/types";
import { useChartCalculations } from "@/hooks/stock/useChartCalculations";
import ChartRenderer from "./ChartRenderer";
import ChartInfo from "./ChartInfo";

const StockMiniChart: React.FC<StockMiniChartProps> = memo(
  ({ data, height = 120 }) => {
    const {
      hasData,
      yDomain,
      startPrice,
      currentPrice,
      lineColor,
      priceChangePercentage,
      priceChangeClass,
    } = useChartCalculations(data);

    if (!hasData) {
      return (
        <div className="stock-mini-chart-placeholder">
          <p>차트 데이터 수집 중...</p>
        </div>
      );
    }

    return (
      <div className="stock-mini-chart">
        {/* 차트 렌더링 컴포넌트 */}
        <ChartRenderer
          data={data}
          yDomain={yDomain}
          startPrice={startPrice}
          lineColor={lineColor}
          height={height}
        />

        {/* 차트 정보 컴포넌트 */}
        <ChartInfo
          startPrice={startPrice}
          currentPrice={currentPrice}
          priceChangePercentage={priceChangePercentage}
          priceChangeClass={priceChangeClass}
        />
      </div>
    );
  }
);

StockMiniChart.displayName = "StockMiniChart";

export default StockMiniChart;
