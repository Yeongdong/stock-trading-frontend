import React, { useState, useEffect, useCallback } from "react";
import { useBuyableInquiry } from "@/hooks/trading/useBuyableInquiry";
import { useCurrentPrice } from "@/hooks/stock/useCurrentPrice";
import { BuyableInquiryRequest, BuyableInquiryFormProps } from "@/types";
import useDebounce from "@/hooks/common/useDebounce";

const BuyableInquiryForm: React.FC<BuyableInquiryFormProps> = ({
  onResult,
  initialStockCode = "",
  initialOrderPrice = 0,
}) => {
  const [stockCode, setStockCode] = useState(initialStockCode);
  const [orderPrice, setOrderPrice] = useState(initialOrderPrice.toString());
  const [orderType, setOrderType] = useState("00");
  const [autoFetchPrice, setAutoFetchPrice] = useState(true);

  const { isLoading, error, getBuyableInquiry } = useBuyableInquiry();
  const { getCurrentPrice, isLoading: isPriceLoading } = useCurrentPrice();
  const debouncedStockCode = useDebounce(stockCode, 500);

  const fetchCurrentPrice = useCallback(
    async (code: string) => {
      try {
        const response = await getCurrentPrice({ stockCode: code });
        if (response?.data) {
          setOrderPrice(response.data.currentPrice.toString());
        }
      } catch (error) {
        console.error("현재가 조회 실패:", error);
      }
    },
    [getCurrentPrice]
  );

  useEffect(() => {
    if (
      debouncedStockCode &&
      debouncedStockCode.length === 6 &&
      /^\d{6}$/.test(debouncedStockCode) &&
      autoFetchPrice
    ) {
      fetchCurrentPrice(debouncedStockCode);
    }
  }, [debouncedStockCode, autoFetchPrice, fetchCurrentPrice]);

  const handleStockCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setStockCode(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockCode.trim()) {
      alert("종목코드를 입력해주세요.");
      return;
    }

    if (!orderPrice || parseFloat(orderPrice) <= 0) {
      alert("유효한 주문가격을 입력해주세요.");
      return;
    }

    const request: BuyableInquiryRequest = {
      stockCode: stockCode.trim(),
      orderPrice: parseFloat(orderPrice),
      orderType,
    };

    const [buyableResult, currentPriceResult] = await Promise.all([
      getBuyableInquiry(request),
      getCurrentPrice({ stockCode: stockCode.trim() }),
    ]);

    if (buyableResult && onResult) {
      const enhancedResult = {
        ...buyableResult,
        latestPrice: currentPriceResult?.data || undefined,
      };
      onResult(enhancedResult);
    }
  };

  return (
    <div className="buyable-inquiry-form">
      <div className="form-header">
        <h3>매수가능조회</h3>
        <div className="auto-price-toggle">
          <label htmlFor="autoFetchPrice">
            <input
              type="checkbox"
              id="autoFetchPrice"
              checked={autoFetchPrice}
              onChange={(e) => setAutoFetchPrice(e.target.checked)}
            />
            자동 현재가 조회
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="stockCode">종목코드</label>
            <div className="input-with-indicator">
              <input
                type="text"
                id="stockCode"
                value={stockCode}
                onChange={handleStockCodeChange}
                placeholder="예: 005930"
                maxLength={6}
                disabled={isLoading}
                required
              />
              {isPriceLoading && (
                <div className="price-loading-indicator">
                  <span className="loading-spinner">⟳</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="orderPrice">주문가격</label>
            <div className="input-with-action">
              <input
                type="number"
                id="orderPrice"
                value={orderPrice}
                onChange={(e) => setOrderPrice(e.target.value)}
                placeholder="주문가격 입력"
                min="1"
                step="1"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => stockCode && fetchCurrentPrice(stockCode)}
                disabled={!stockCode || isPriceLoading}
                className="fetch-price-btn"
                title="현재가 가져오기"
              >
                🔄
              </button>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="orderType">주문구분</label>
            <select
              id="orderType"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              disabled={isLoading}
            >
              <option value="00">지정가</option>
              <option value="01">시장가</option>
            </select>
          </div>

          <div className="form-group">
            <button
              type="submit"
              disabled={isLoading || isPriceLoading}
              className="inquiry-button"
            >
              {isLoading ? "조회중..." : "매수가능조회"}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default BuyableInquiryForm;
