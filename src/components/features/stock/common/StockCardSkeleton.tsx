import { StockCardSkeletonProps } from "@/types";
import React from "react";

/**
 * 주식 데이터 로딩 중 표시되는 스켈레톤 컴포넌트
 * 실제 컨텐츠와 동일한 크기와 구조를 유지하여 UI 깜빡임을 방지
 */
const StockCardSkeleton: React.FC<StockCardSkeletonProps> = ({ symbol }) => {
  return (
    <div className="stock-card skeleton">
      <div className="card-header skeleton-header">
        <div className="stock-symbol">{symbol}</div>
        <div className="skeleton-name"></div>
      </div>

      <div className="price-container">
        <div className="skeleton-price"></div>
        <div className="skeleton-change"></div>
      </div>

      <div className="skeleton-chart">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>

      <div className="trading-info skeleton-trading">
        <div className="skeleton-volume"></div>
        <div className="skeleton-time"></div>
      </div>
    </div>
  );
};

export default StockCardSkeleton;
