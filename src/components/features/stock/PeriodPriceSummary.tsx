import React from "react";
import styles from "./PeriodPriceSummary.module.css";
import { SummaryData } from "./PeriodPriceChartModel";

interface PeriodPriceSummaryProps {
  summaryData: SummaryData;
}

export const PeriodPriceSummary: React.FC<PeriodPriceSummaryProps> = ({
  summaryData,
}) => {
  return (
    <div className={styles.summary}>
      {summaryData.items.map((item, index) => (
        <div key={index} className={styles.summaryItem}>
          <span className={styles.label}>{item.label}</span>
          <span className={`${styles[item.className]}`}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};
