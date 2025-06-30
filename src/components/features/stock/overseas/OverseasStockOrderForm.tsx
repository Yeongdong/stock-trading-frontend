import React, { useState, useEffect, useCallback } from "react";
import { useOverseasStockOrder } from "@/hooks/stock/useOverseasStockOrder";
import styles from "../order/StockOrderForm.module.css";
import {
  OVERSEAS_ORDER_DIVISIONS,
  OVERSEAS_ORDER_CONDITIONS,
  OverseasOrderFormData,
} from "@/types/domains/stock/overseas-order";

interface OverseasStockOrderFormProps {
  selectedStockCode?: string;
  initialStockCode?: string;
  initialMarket?: string;
  initialPrice?: number;
  onOrderSuccess?: () => void;
}

const OverseasStockOrderForm: React.FC<OverseasStockOrderFormProps> = ({
  selectedStockCode,
  initialStockCode,
  initialMarket,
  initialPrice,
  onOrderSuccess,
}) => {
  const { isLoading, submitOrder } = useOverseasStockOrder();

  const [formData, setFormData] = useState<OverseasOrderFormData>({
    pdno: selectedStockCode || initialStockCode || "",
    ovsExcgCd: getExchangeCodeFromMarket(initialMarket) || "NASD",
    trId: "VTTT1002U",
    ordDvsn: "00",
    ordQty: "",
    ordUnpr: initialPrice ? initialPrice.toString() : "",
    ordCndt: "DAY",
    orderMode: "immediate",
  });

  const selectedOrderDivision = OVERSEAS_ORDER_DIVISIONS.find(
    (division) => division.value === formData.ordDvsn
  );
  const requiresPrice = selectedOrderDivision?.requiresPrice ?? true;

  // 종목코드 또는 현재가 변경 시 처리
  useEffect(() => {
    if (selectedStockCode) {
      setFormData((prev) => ({
        ...prev,
        pdno: selectedStockCode,
        // 종목 선택 시 현재가가 있으면 자동으로 주문 단가에 설정
        ordUnpr:
          initialPrice && initialPrice > 0
            ? initialPrice.toFixed(2)
            : prev.ordUnpr,
      }));
    } else if (initialStockCode) {
      setFormData((prev) => ({
        ...prev,
        pdno: initialStockCode,
        // 초기 종목 설정 시에도 현재가 자동 설정
        ordUnpr:
          initialPrice && initialPrice > 0
            ? initialPrice.toFixed(2)
            : prev.ordUnpr,
      }));
    }
  }, [selectedStockCode, initialStockCode, initialPrice]);

  // 현재가만 변경될 때 (종목이 이미 선택된 상태에서 가격 업데이트)
  useEffect(() => {
    if (initialPrice && initialPrice > 0 && formData.pdno) {
      setFormData((prev) => ({
        ...prev,
        ordUnpr: initialPrice.toFixed(2),
      }));
    }
  }, [initialPrice, formData.pdno]);

  const handleInputChange = useCallback(
    (field: keyof OverseasOrderFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const success = await submitOrder(formData);

      if (success) {
        setFormData((prev) => ({
          ...prev,
          ordQty: "",
          ordUnpr: initialPrice ? initialPrice.toFixed(2) : "",
          scheduledExecutionTime: undefined,
        }));

        onOrderSuccess?.();
      }
    },
    [formData, submitOrder, onOrderSuccess, initialPrice]
  );

  const getCurrencySymbol = (exchangeCode: string): string => {
    switch (exchangeCode) {
      case "NASD":
      case "NYSE":
      case "AMEX":
        return "USD";
      case "TKSE":
        return "JPY";
      case "LNSE":
        return "GBP";
      case "SEHK":
        return "HKD";
      default:
        return "USD";
    }
  };

  const getStockCodePlaceholder = (): string => {
    switch (formData.ovsExcgCd) {
      case "NASD":
      case "NYSE":
        return "해외 종목 코드 (예: AAPL, TSLA)";
      case "TKSE":
        return "일본 종목 코드 (예: 7203, 6758)";
      case "LNSE":
        return "영국 종목 코드 (예: LLOY, BP)";
      case "SEHK":
        return "홍콩 종목 코드 (예: 0700, 0941)";
      default:
        return "종목 코드를 입력하세요";
    }
  };

  return (
    <>
      <div className={styles.formHeader}>
        <h2>해외 주식 주문</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset className={styles.fieldset}>
          <legend>주문 정보</legend>

          {/* 종목코드 */}
          <div className={styles.formGroup}>
            <label htmlFor="pdno">종목 코드</label>
            <input
              id="pdno"
              type="text"
              value={formData.pdno}
              onChange={(e) =>
                handleInputChange("pdno", e.target.value.toUpperCase())
              }
              placeholder={getStockCodePlaceholder()}
              className={styles.input}
              disabled={isLoading}
              required
            />
          </div>

          {/* 주문수량 */}
          <div className={styles.formGroup}>
            <label htmlFor="ordQty">주문 수량</label>
            <input
              id="ordQty"
              type="number"
              min="1"
              value={formData.ordQty}
              onChange={(e) => handleInputChange("ordQty", e.target.value)}
              placeholder="주문 수량"
              className={styles.input}
              disabled={isLoading}
              required
            />
          </div>

          {/* 주문단가 */}
          {requiresPrice && (
            <div className={styles.formGroup}>
              <div className={styles.priceInputHeader}>
                <label htmlFor="ordUnpr">주문 단가</label>
              </div>
              <input
                id="ordUnpr"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.ordUnpr}
                onChange={(e) => handleInputChange("ordUnpr", e.target.value)}
                placeholder="주문 단가"
                className={styles.input}
                disabled={isLoading}
                required={requiresPrice}
              />
              <div className={styles.helperText}>
                {getCurrencySymbol(formData.ovsExcgCd)} 단위로 입력해주세요
                {initialPrice && initialPrice > 0 && (
                  <span className={styles.currentPriceInfo}>
                    (현재가: {getCurrencySymbol(formData.ovsExcgCd)}
                    {initialPrice.toFixed(2)})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 주문조건 */}
          <div className={styles.formGroup}>
            <label htmlFor="ordCndt">주문 조건</label>
            <select
              id="ordCndt"
              value={formData.ordCndt}
              onChange={(e) =>
                handleInputChange("ordCndt", e.target.value as "DAY" | "FTC")
              }
              className={styles.select}
              disabled={isLoading}
            >
              {OVERSEAS_ORDER_CONDITIONS.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={
              isLoading ||
              !formData.pdno ||
              !formData.ordQty ||
              (requiresPrice && !formData.ordUnpr)
            }
            className={styles.orderButton}
          >
            {isLoading ? "주문 처리 중..." : "주문하기"}
          </button>
        </fieldset>
      </form>
    </>
  );
};

function getExchangeCodeFromMarket(market?: string): string | undefined {
  if (!market) return undefined;

  const marketToCode: Record<string, string> = {
    nasdaq: "NASD",
    nyse: "NYSE",
    tokyo: "TKSE",
    london: "LNSE",
    hongkong: "SEHK",
  };

  return marketToCode[market.toLowerCase()];
}

export default OverseasStockOrderForm;
