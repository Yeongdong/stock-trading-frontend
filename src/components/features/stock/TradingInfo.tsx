import React from "react";

interface TradingInfoProps {
  volume: number;
  time: string;
}

const TradingInfo: React.FC<TradingInfoProps> = ({ volume, time }) => {
  return (
    <div className="trading-info">
      <div className="volume">
        <span className="label">거래량:</span>
        <span className="value">{Number(volume).toLocaleString()}</span>
      </div>
      <div className="time">
        <span className="label">업데이트:</span>
        <span className="value">{time}</span>
      </div>
    </div>
  );
};

export default TradingInfo;
