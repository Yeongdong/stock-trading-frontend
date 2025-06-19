import React, { useState, useCallback, useEffect } from "react";
import { useBuyableInquiry } from "@/hooks/trading/useBuyableInquiry";
import { useCurrentPrice } from "@/hooks/stock/useCurrentPrice";
import useDebounce from "@/hooks/common/useDebounce";
import {
  BuyableInquiryRequest,
  BuyableInquiryResponse,
} from "@/types/domains/order/entities";
import styles from "./BuyableInquiry.module.css";
import { BuyableInquiryProps } from "@/types";
import { ORDER_TYPES } from "@/constants/order";
import {
  formatKRW,
  formatNumber,
  isValidStockCode,
  isPositiveNumber,
} from "@/utils";

const BuyableInquiry: React.FC<BuyableInquiryProps> = ({
  selectedStockCode = "",
  onOrderRequest,
}) => {
  // Form 상태
  const [stockCode, setStockCode] = useState(selectedStockCode);
  const [orderPrice, setOrderPrice] = useState("");
  const [orderType, setOrderType] = useState("00");
  const [autoFetchPrice, setAutoFetchPrice] = useState(true);

  // 결과 상태
  const [inquiryResult, setInquiryResult] =
    useState<BuyableInquiryResponse | null>(null);

  const { isLoading, getBuyableInquiry } = useBuyableInquiry();
  const { getCurrentPrice, isLoading: isPriceLoading } = useCurrentPrice();
  const debouncedStockCode = useDebounce(stockCode, 500);

  // 선택된 종목 코드 변경 시 업데이트
  useEffect(() => {
    if (selectedStockCode && selectedStockCode !== stockCode) {
      setStockCode(selectedStockCode);
      setInquiryResult(null);
    }
  }, [selectedStockCode, stockCode]);

  // 자동 현재가 조회
  const fetchCurrentPrice = useCallback(
    async (code: string) => {
      if (!autoFetchPrice) return;

      try {
        const response = await getCurrentPrice({ stockCode: code });
        if (response?.data)
          setOrderPrice(response.data.currentPrice.toString());
      } catch (error) {
        console.error("현재가 조회 실패:", error);
      }
    },
    [getCurrentPrice, autoFetchPrice]
  );

  // 디바운싱된 종목코드로 자동 현재가 조회
  useEffect(() => {
    if (debouncedStockCode && isValidStockCode(debouncedStockCode))
      fetchCurrentPrice(debouncedStockCode);
  }, [debouncedStockCode, fetchCurrentPrice]);

  const handleStockCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
      setStockCode(value);

      if (isValidStockCode(value) && autoFetchPrice) fetchCurrentPrice(value);
    },
    [autoFetchPrice, fetchCurrentPrice]
  );

  const handleOrderPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^\d]/g, "");
      setOrderPrice(value);
    },
    []
  );

  const handleManualPriceFetch = useCallback(async () => {
    if (!stockCode || !isValidStockCode(stockCode)) return;

    await fetchCurrentPrice(stockCode);
  }, [stockCode, fetchCurrentPrice]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isValidStockCode(stockCode)) return;
      if (!isPositiveNumber(orderPrice)) return;

      const request: BuyableInquiryRequest = {
        stockCode: stockCode.trim(),
        orderPrice: parseFloat(orderPrice),
        orderType,
      };

      const result = await getBuyableInquiry(request);
      if (result) setInquiryResult(result);
    },
    [stockCode, orderPrice, orderType, getBuyableInquiry]
  );

  const handleOrderClick = useCallback(() => {
    if (!inquiryResult || !onOrderRequest) return;

    onOrderRequest(
      inquiryResult.stockCode,
      inquiryResult.orderPrice,
      inquiryResult.buyableQuantity
    );
  }, [inquiryResult, onOrderRequest]);

  const isSubmitDisabled =
    isLoading ||
    !stockCode.trim() ||
    !orderPrice ||
    parseFloat(orderPrice) <= 0;

  return (
    <div className={styles.buyableInquiry}>
      <div className={styles.header}>
        <h3>매수가능조회</h3>
        <div className={styles.autoPriceToggle}>
          <label>
            <input
              type="checkbox"
              checked={autoFetchPrice}
              onChange={(e) => setAutoFetchPrice(e.target.checked)}
            />
            자동 현재가 조회
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="stockCode">종목코드</label>
            <div className={styles.inputWithIndicator}>
              <input
                type="text"
                id="stockCode"
                value={stockCode}
                onChange={handleStockCodeChange}
                placeholder="예: 005930"
                maxLength={6}
                disabled={isLoading}
                className={styles.input}
                required
              />
              {isPriceLoading && (
                <div className={styles.loadingIndicator}>⟳</div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="orderPrice">주문가격</label>
            <div className={styles.inputWithAction}>
              <input
                type="number"
                id="orderPrice"
                value={orderPrice}
                onChange={handleOrderPriceChange}
                placeholder="주문가격 입력"
                min="1"
                step="1"
                disabled={isLoading}
                className={styles.input}
                required
              />
              <button
                type="button"
                onClick={handleManualPriceFetch}
                disabled={isLoading || isPriceLoading || !stockCode}
                className={styles.fetchButton}
              >
                현재가
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="orderType">주문구분</label>
            <select
              id="orderType"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              disabled={isLoading}
              className={styles.select}
            >
              {ORDER_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={styles.submitButton}
          >
            {isLoading ? "조회중..." : "조회"}
          </button>
        </div>
      </form>

      {inquiryResult && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <h4>
              {inquiryResult.stockName} ({inquiryResult.stockCode})
            </h4>
          </div>

          <div className={styles.resultGrid}>
            <div className={styles.resultItem}>
              <span className={styles.label}>매수가능금액</span>
              <span className={`${styles.value} ${styles.primary}`}>
                {formatKRW(inquiryResult.buyableAmount)}
              </span>
            </div>

            <div className={styles.resultItem}>
              <span className={styles.label}>매수가능수량</span>
              <span className={`${styles.value} ${styles.primary}`}>
                {formatNumber(inquiryResult.buyableQuantity)}주
              </span>
            </div>

            <div className={styles.resultItem}>
              <span className={styles.label}>보유현금</span>
              <span className={styles.value}>
                {formatKRW(inquiryResult.cashBalance)}
              </span>
            </div>

            <div className={styles.resultItem}>
              <span className={styles.label}>주문가격</span>
              <span className={styles.value}>
                {formatKRW(inquiryResult.orderPrice)}
              </span>
            </div>

            <div className={styles.resultItem}>
              <span className={styles.label}>현재가</span>
              <span className={styles.value}>
                {formatKRW(inquiryResult.currentPrice)}
              </span>
            </div>

            <div className={styles.resultItem}>
              <span className={styles.label}>주문단위</span>
              <span className={styles.value}>
                {formatNumber(inquiryResult.unitQuantity)}주
              </span>
            </div>
          </div>

          {inquiryResult.buyableQuantity > 0 ? (
            <div className={styles.resultActions}>
              {onOrderRequest && (
                <button
                  onClick={handleOrderClick}
                  className={styles.orderButton}
                >
                  이 조건으로 주문하기
                </button>
              )}
            </div>
          ) : (
            <div className={styles.warningMessage}>
              현재 조건으로는 매수가 불가능합니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyableInquiry;
