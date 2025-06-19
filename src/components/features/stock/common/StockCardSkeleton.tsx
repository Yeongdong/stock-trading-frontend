import React, { memo } from "react";
import { StockCardSkeletonProps } from "@/types";
import styles from "./StockCardSkeleton.module.css";

/**
 * 주식 데이터 로딩 중 표시되는 스켈레톤 컴포넌트
 */
const StockCardSkeleton: React.FC<StockCardSkeletonProps> = memo(
  ({ symbol }) => {
    return (
      <div className={styles.stockCard}>
        <div className={styles.cardHeader}>
          <div className={styles.stockSymbol}>{symbol}</div>
          <div className={styles.skeletonName}></div>
        </div>

        <div className={styles.priceContainer}>
          <div className={styles.skeletonPrice}></div>
          <div className={styles.skeletonChange}></div>
        </div>

        <div className={styles.skeletonChart}>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLine}></div>
        </div>

        <div className={styles.tradingInfo}>
          <div className={styles.skeletonVolume}></div>
          <div className={styles.skeletonTime}></div>
        </div>
      </div>
    );
  }
);

StockCardSkeleton.displayName = "StockCardSkeleton";

export default StockCardSkeleton;
