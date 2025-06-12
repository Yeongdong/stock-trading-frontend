import React, { useState, useEffect } from "react";
import { BuyableInquiryResultProps } from "@/types/components/buyableInquiry";
import { useCurrentPrice } from "@/hooks/stock/useCurrentPrice";
import styles from "./BuyableInquiryResult.module.css";

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
    <div className={styles.buyableInquiryResult}>
      <div className={styles.resultHeader}>
        <h4>매수가능정보</h4>
        <div className={styles.stockInfo}>
          <span className={styles.stockName}>{data.stockName}</span>
          <span className={styles.stockCode}>({data.stockCode})</span>
        </div>
      </div>

      <div className={styles.resultGrid}>
        {/* 현재가 섹션 - 새로고침 기능 포함 */}
        <div
          className={`${styles.resultItem} ${styles.currentPriceItem} ${
            isPriceDifferent ? styles.highlight : ""
          }`}
        >
          <div className={styles.priceHeader}>
            <span className={styles.label}>현재가</span>
            <button
              onClick={handleRefreshPrice}
              disabled={isPriceLoading}
              className={styles.refreshPriceBtn}
              title="현재가 새로고침"
            >
              {isPriceLoading ? "⟳" : "↻"}
            </button>
          </div>
          <div className={styles.priceInfo}>
            <span
              className={`${styles.value} ${
                styles[getPriceChangeClass(priceChangeInfo.changeType)]
              }`}
            >
              {formatCurrency(displayPrice)}
            </span>
            <div className={styles.priceChangeInfo}>
              <span
                className={`${styles.changeAmount} ${
                  styles[getPriceChangeClass(priceChangeInfo.changeType)]
                }`}
              >
                {priceChangeInfo.change > 0 ? "+" : ""}
                {formatCurrency(priceChangeInfo.change)}
              </span>
              <span
                className={`${styles.changeRate} ${
                  styles[getPriceChangeClass(priceChangeInfo.changeType)]
                }`}
              >
                ({priceChangeInfo.changeRate > 0 ? "+" : ""}
                {priceChangeInfo.changeRate.toFixed(2)}%)
              </span>
              <span className={styles.changeType}>
                [{priceChangeInfo.changeType}]
              </span>
              {priceChangeInfo.inquiryTime && (
                <span className={styles.inquiryTime}>
                  ({priceChangeInfo.inquiryTime})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.resultItem}>
          <span className={styles.label}>매수가능금액</span>
          <span className={`${styles.value} ${styles.primary}`}>
            {formatCurrency(data.buyableAmount)}
          </span>
        </div>

        <div className={styles.resultItem}>
          <span className={styles.label}>매수가능수량</span>
          <span className={`${styles.value} ${styles.primary}`}>
            {formatNumber(data.buyableQuantity)}주
          </span>
        </div>

        <div className={styles.resultItem}>
          <span className={styles.label}>주문가능금액</span>
          <span className={styles.value}>
            {formatCurrency(data.orderableAmount)}
          </span>
        </div>

        <div className={styles.resultItem}>
          <span className={styles.label}>보유현금</span>
          <span className={styles.value}>
            {formatCurrency(data.cashBalance)}
          </span>
        </div>

        <div className={styles.resultItem}>
          <span className={styles.label}>주문가격</span>
          <span className={styles.value}>
            {formatCurrency(data.orderPrice)}
          </span>
        </div>

        <div className={styles.resultItem}>
          <span className={styles.label}>주문단위</span>
          <span className={styles.value}>
            {formatNumber(data.unitQuantity)}주
          </span>
        </div>
      </div>

      {/* 가격 차이 경고 메시지 */}
      {isPriceDifferent && (
        <div className={styles.priceWarning}>
          <strong>💡 가격 변동 알림:</strong> 현재가가 주문가격과 다릅니다. 주문
          전 최신 가격을 확인해주세요.
        </div>
      )}

      {onOrderClick && data.buyableQuantity > 0 && (
        <div className={styles.resultActions}>
          <button
            onClick={() => onOrderClick(data.stockCode, data.buyableQuantity)}
            className={styles.orderButton}
          >
            이 조건으로 주문하기
          </button>
        </div>
      )}

      {data.buyableQuantity === 0 && (
        <div className={styles.warningMessage}>
          현재 조건으로는 매수가 불가능합니다.
        </div>
      )}
    </div>
  );
};

export default BuyableInquiryResult;
