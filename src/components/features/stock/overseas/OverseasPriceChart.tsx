// 임시 컴포넌트 - 추후 구현

import React from "react";
import { OverseasMarket } from "@/types/domains/stock/overseas";
import styles from "./OverseasPriceChart.module.css";

interface OverseasPriceChartProps {
  stockName: string;
  stockCode: string;
  market: OverseasMarket;
}

const OverseasPriceChart: React.FC<OverseasPriceChartProps> = ({
  stockName,
  stockCode,
  market,
}) => {
  if (!stockCode) {
    return (
      <div className={styles.emptyChart}>
        <h3>해외 주식 차트</h3>
        <p>종목을 선택하면 차트가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.overseasPriceChart}>
      <div className={styles.chartHeader}>
        <h3>
          {stockName || stockCode} ({stockCode})
        </h3>
        <span className={styles.market}>{market.toUpperCase()}</span>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.placeholder}>
          <p>📈 해외 주식 차트</p>
          <p>종목: {stockCode}</p>
          <p>시장: {market}</p>
          <p>(차트 구현 예정)</p>
        </div>
      </div>

      <div className={styles.priceInfo}>
        <div className={styles.priceItem}>
          <span>현재가</span>
          <span>$150.25</span>
        </div>
        <div className={styles.priceItem}>
          <span>전일대비</span>
          <span className={styles.positive}>+2.45 (+1.65%)</span>
        </div>
        <div className={styles.priceItem}>
          <span>거래량</span>
          <span>45,234,567</span>
        </div>
      </div>
    </div>
  );
};

export default OverseasPriceChart;
