import React, { useState } from "react";
import { useBuyableInquiry } from "@/hooks/trading/useBuyableInquiry";
import { BuyableInquiryRequest, BuyableInquiryFormProps } from "@/types";

const BuyableInquiryForm: React.FC<BuyableInquiryFormProps> = ({
  onResult,
  initialStockCode = "",
  initialOrderPrice = 0,
}) => {
  const [stockCode, setStockCode] = useState(initialStockCode);
  const [orderPrice, setOrderPrice] = useState(initialOrderPrice.toString());
  const [orderType, setOrderType] = useState("00");

  const { isLoading, error, getBuyableInquiry } = useBuyableInquiry();

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

    const result = await getBuyableInquiry(request);
    if (result && onResult) {
      onResult(result);
    }
  };

  return (
    <div className="buyable-inquiry-form">
      <h3>매수가능조회</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="stockCode">종목코드</label>
            <input
              type="text"
              id="stockCode"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              placeholder="예: 005930"
              maxLength={6}
              pattern="[0-9]*"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="orderPrice">주문가격</label>
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
              disabled={isLoading}
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
