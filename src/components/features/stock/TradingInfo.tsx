import React, { memo, useMemo } from "react";
import { TradingInfoProps } from "@/types";

const TradingInfo: React.FC<TradingInfoProps> = memo(({ volume, time }) => {
  // 거래량 포맷팅
  const formattedVolume = useMemo(
    () => Number(volume).toLocaleString(),
    [volume]
  );

  return (
    <div className="trading-info">
      <div className="volume">
        <span className="label">거래량:</span>
        <span className="value">{formattedVolume}</span>
      </div>
      <div className="time">
        <span className="label">업데이트:</span>
        <span className="value">{time}</span>
      </div>
    </div>
  );
});

TradingInfo.displayName = "TradingInfo";

export default TradingInfo;
