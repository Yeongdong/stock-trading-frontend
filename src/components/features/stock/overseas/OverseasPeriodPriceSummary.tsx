import React from "react";
import { OverseasSummaryData } from "./OverseasPeriodPriceChartModel";
import styles from "./OverseasPeriodPriceSummary.module.css";

interface OverseasPeriodPriceSummaryProps {
  summaryData: OverseasSummaryData;
}

export const OverseasPeriodPriceSummary: React.FC<
  OverseasPeriodPriceSummaryProps
> = ({ summaryData }) => {
  return (
    <div className={styles.summary}>
      {summaryData.items.map((item, index) => (
        <div key={index} className={styles.summaryItem}>
          <div className={styles.label}>{item.label}</div>
          <div className={`${styles.value} ${styles[item.className] || ""}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};
