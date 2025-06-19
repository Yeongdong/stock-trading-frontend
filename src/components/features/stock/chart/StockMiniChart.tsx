import React, { memo } from "react";
import { useChartCalculations } from "@/hooks/stock/useChartCalculations";
import ChartRenderer from "./ChartRenderer";
import ChartInfo from "./ChartInfo";
import styles from "./StockMiniChart.module.css";
import { StockMiniChartProps } from "@/types";

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
    } = useChartCalculations(data || []);

    if (!hasData)
      return (
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>📊</div>
          <p className={styles.placeholderText}>차트 데이터 수집 중...</p>
        </div>
      );

    return (
      <div className={styles.chartContainer}>
        <ChartRenderer
          data={data || []}
          yDomain={yDomain}
          startPrice={startPrice}
          lineColor={lineColor}
          height={height}
        />

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
