import React, { memo } from "react";
import { ChartInfoProps } from "@/types";

const ChartInfo: React.FC<ChartInfoProps> = memo(
  ({ startPrice, currentPrice, priceChangePercentage, priceChangeClass }) => (
    <div className="chart-info">
      <div className="chart-label">
        <span>시작:</span>
        <span className="chart-value">{startPrice.toLocaleString()} 원</span>
      </div>
      <div className="chart-label">
        <span>현재:</span>
        <span className="chart-value">
          {currentPrice.toLocaleString()} 원{" "}
          <span className={priceChangeClass}>
            ({priceChangePercentage.toFixed(2)}%)
          </span>
        </span>
      </div>
    </div>
  )
);

ChartInfo.displayName = "ChartInfo";

export default ChartInfo;
