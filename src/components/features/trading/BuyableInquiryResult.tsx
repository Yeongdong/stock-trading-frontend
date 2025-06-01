import React from "react";
import { BuyableInquiryResultProps } from "@/types/components/buyableInquiry";

const BuyableInquiryResult: React.FC<BuyableInquiryResultProps> = ({
  data,
  onOrderClick,
}) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `${formatNumber(amount)}원`;
  };

  return (
    <div className="buyable-inquiry-result">
      <div className="result-header">
        <h4>매수가능정보</h4>
        <div className="stock-info">
          <span className="stock-name">{data.stockName}</span>
          <span className="stock-code">({data.stockCode})</span>
        </div>
      </div>

      <div className="result-grid">
        <div className="result-item">
          <span className="label">현재가</span>
          <span className="value">{formatCurrency(data.currentPrice)}</span>
        </div>

        <div className="result-item">
          <span className="label">주문가격</span>
          <span className="value">{formatCurrency(data.orderPrice)}</span>
        </div>

        <div className="result-item highlight">
          <span className="label">매수가능수량</span>
          <span className="value primary">
            {formatNumber(data.buyableQuantity)}주
          </span>
        </div>

        <div className="result-item highlight">
          <span className="label">매수가능금액</span>
          <span className="value primary">
            {formatCurrency(data.buyableAmount)}
          </span>
        </div>

        <div className="result-item">
          <span className="label">주문가능금액</span>
          <span className="value">{formatCurrency(data.orderableAmount)}</span>
        </div>

        <div className="result-item">
          <span className="label">현금잔고</span>
          <span className="value">{formatCurrency(data.cashBalance)}</span>
        </div>
      </div>

      {onOrderClick && data.buyableQuantity > 0 && (
        <div className="result-actions">
          <button
            onClick={() => onOrderClick(data.stockCode, data.buyableQuantity)}
            className="order-button"
          >
            이 조건으로 주문하기
          </button>
        </div>
      )}

      {data.buyableQuantity === 0 && (
        <div className="warning-message">
          현재 조건으로는 매수가 불가능합니다.
        </div>
      )}
    </div>
  );
};

export default BuyableInquiryResult;
