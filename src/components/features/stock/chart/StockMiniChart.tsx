import React, { memo, useMemo } from "react";
import { useChartCalculations } from "@/hooks/stock/useChartCalculations";
import ChartRenderer from "./ChartRenderer";
import ChartInfo from "./ChartInfo";
import styles from "./StockMiniChart.module.css";
import { StockMiniChartProps } from "@/types";

const StockMiniChart: React.FC<StockMiniChartProps> = memo(
  ({ data, height = 120 }) => {
    const chartCalculations = useChartCalculations(data);

    const {
      hasData,
      yDomain,
      startPrice,
      currentPrice,
      lineColor,
      priceChangePercentage,
      priceChangeClass,
    } = chartCalculations;

    // 차트 데이터가 없는 경우 메모이제이션
    const placeholderContent = useMemo(
      () => (
        <div className={styles.placeholder}>
          <p>차트 데이터 수집 중...</p>
        </div>
      ),
      []
    );

    if (!hasData) {
      return placeholderContent;
    }

    return (
      <div className={styles.chartContainer}>
        <ChartRenderer
          data={data}
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
  },
  // props 비교 함수로 불필요한 리렌더링 방지
  (prevProps, nextProps) => {
    return (
      prevProps.symbol === nextProps.symbol &&
      prevProps.height === nextProps.height &&
      prevProps.data.length === nextProps.data.length &&
      (prevProps.data.length === 0 ||
        prevProps.data[prevProps.data.length - 1]?.price ===
          nextProps.data[nextProps.data.length - 1]?.price)
    );
  }
);

StockMiniChart.displayName = "StockMiniChart";

export default StockMiniChart;
