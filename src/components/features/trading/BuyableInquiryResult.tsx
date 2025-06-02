import React, { useState, useEffect } from "react";
import { BuyableInquiryResultProps } from "@/types/components/buyableInquiry";
import { useCurrentPrice } from "@/hooks/stock/useCurrentPrice";

const BuyableInquiryResult: React.FC<BuyableInquiryResultProps> = ({
  data,
  onOrderClick,
}) => {
  // latestPrice가 있으면 그것을 우선 사용, 없으면 기본 currentPrice 사용
  const [displayPrice, setDisplayPrice] = useState(
    data.latestPrice?.currentPrice || data.currentPrice
  );
  const [priceChangeInfo, setPriceChangeInfo] = useState<{
    change: number;
    changeRate: number;
    changeType: string;
    inquiryTime?: string;
  }>({
    change: data.latestPrice?.priceChange || 0,
    changeRate: data.latestPrice?.changeRate || 0,
    changeType: data.latestPrice?.changeType || "보합",
    inquiryTime: data.latestPrice?.inquiryTime,
  });

  const { getCurrentPrice, isLoading: isPriceLoading } = useCurrentPrice();

  // 컴포넌트 마운트 시 최신 현재가 정보로 초기화
  useEffect(() => {
    if (data.latestPrice) {
      setDisplayPrice(data.latestPrice.currentPrice);
      setPriceChangeInfo({
        change: data.latestPrice.priceChange,
        changeRate: data.latestPrice.changeRate,
        changeType: data.latestPrice.changeType,
        inquiryTime: data.latestPrice.inquiryTime,
      });
    } else {
      setDisplayPrice(data.currentPrice);
    }
  }, [data]);

  // 현재가 새로고침 함수
  const handleRefreshPrice = async () => {
    try {
      const response = await getCurrentPrice({ stockCode: data.stockCode });
      if (response?.data) {
        const newPrice = response.data.currentPrice;
        setDisplayPrice(newPrice);
        setPriceChangeInfo({
          change: response.data.priceChange,
          changeRate: response.data.changeRate,
          changeType: response.data.changeType,
          inquiryTime: response.data.inquiryTime,
        });
      }
    } catch (error) {
      console.error("현재가 새로고침 실패:", error);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `${formatNumber(amount)}원`;
  };

  // changeType을 기반으로 한 스타일 클래스 (한국어 대응)
  const getPriceChangeClass = (changeType: string) => {
    switch (changeType) {
      case "상승":
        return "price-up";
      case "하락":
        return "price-down";
      case "보합":
      default:
        return "price-unchanged";
    }
  };

  // 현재가가 원래 주문가격과 다른지 확인
  const isPriceDifferent = displayPrice !== data.currentPrice;

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
        {/* 현재가 섹션 - 새로고침 기능 포함 */}
        <div
          className={`result-item current-price-item ${
            isPriceDifferent ? "price-updated" : ""
          }`}
        >
          <div className="price-header">
            <span className="label">현재가</span>
            <button
              onClick={handleRefreshPrice}
              disabled={isPriceLoading}
              className="refresh-price-btn"
              title="현재가 새로고침"
            >
              {isPriceLoading ? "⟳" : "🔄"}
            </button>
          </div>
          <div className="price-info">
            <span
              className={`value ${getPriceChangeClass(
                priceChangeInfo.changeType
              )}`}
            >
              {formatCurrency(displayPrice)}
            </span>
            {priceChangeInfo.changeType !== "보합" && (
              <div
                className={`price-change-info ${getPriceChangeClass(
                  priceChangeInfo.changeType
                )}`}
              >
                <span className="change-amount">
                  {priceChangeInfo.change > 0 ? "+" : ""}
                  {formatNumber(priceChangeInfo.change)}
                </span>
                <span className="change-rate">
                  ({priceChangeInfo.changeRate > 0 ? "+" : ""}
                  {priceChangeInfo.changeRate.toFixed(2)}%)
                </span>
                <span className="change-type">
                  {priceChangeInfo.changeType}
                </span>
              </div>
            )}
            {priceChangeInfo.inquiryTime && (
              <div className="inquiry-time">
                조회시간:{" "}
                {new Date(priceChangeInfo.inquiryTime).toLocaleString()}
              </div>
            )}
          </div>
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

      {/* 가격 변동 알림 */}
      {isPriceDifferent && (
        <div className="price-change-notice">
          <span className="notice-icon">ℹ️</span>
          현재가가 조회 시점과 다릅니다. 주문 전 최신 가격을 확인해주세요.
        </div>
      )}

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
