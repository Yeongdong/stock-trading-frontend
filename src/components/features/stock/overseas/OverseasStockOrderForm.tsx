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

// 시장별 거래소 코드 매핑
function getExchangeCodeFromMarket(market?: string): string {
  const marketMap: Record<string, string> = {
    NASDAQ: "NASD",
    NYSE: "NYSE",
    AMEX: "AMEX",
  };
  return marketMap[market || ""] || "NASD";
}

const OverseasStockOrderForm: React.FC<OverseasStockOrderFormProps> = ({
  selectedStockCode,
  initialStockCode,
  initialMarket,
  initialPrice,
  onOrderSuccess,
}) => {
  const { isLoading, submitOrder, validateOrder } = useOverseasStockOrder();

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

  // 종목코드 또는 현재가 변경시 처리
  useEffect(() => {
    if (selectedStockCode) {
      setFormData((prev) => ({
        ...prev,
        pdno: selectedStockCode,
        ordUnpr:
          initialPrice && initialPrice > 0
            ? initialPrice.toFixed(2)
            : prev.ordUnpr,
      }));
    } else if (initialStockCode) {
      setFormData((prev) => ({
        ...prev,
        pdno: initialStockCode,
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
      // 수량 입력 시 정수만 허용
      if (field === "ordQty")
        if (value !== "" && !/^\d+$/.test(value))
          // 숫자와 빈 문자열만 허용
          return; // 유효하지 않은 입력은 무시

      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // 클라이언트 사이드 검증
      const validation = validateOrder(formData);
      if (!validation.isValid) return;

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
    [formData, submitOrder, validateOrder, initialPrice, onOrderSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className={styles.orderForm}>
      <div className={styles.formGroup}>
        <label htmlFor="pdno" className={styles.label}>
          종목코드 (Symbol)
        </label>
        <input
          id="pdno"
          type="text"
          value={formData.pdno}
          onChange={(e) => handleInputChange("pdno", e.target.value)}
          className={styles.input}
          placeholder="예: AAPL, TSLA"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="ovsExcgCd" className={styles.label}>
          거래소
        </label>
        <select
          id="ovsExcgCd"
          value={formData.ovsExcgCd}
          onChange={(e) => handleInputChange("ovsExcgCd", e.target.value)}
          className={styles.select}
          required
        >
          <option value="NASD">나스닥 (NASDAQ)</option>
          <option value="NYSE">뉴욕증권거래소 (NYSE)</option>
          <option value="AMEX">아멕스 (AMEX)</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="ordDvsn" className={styles.label}>
          주문구분
        </label>
        <select
          id="ordDvsn"
          value={formData.ordDvsn}
          onChange={(e) => handleInputChange("ordDvsn", e.target.value)}
          className={styles.select}
          required
        >
          {OVERSEAS_ORDER_DIVISIONS.map((division) => (
            <option key={division.value} value={division.value}>
              {division.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="ordQty" className={styles.label}>
          주문수량 (Shares)
        </label>
        <input
          id="ordQty"
          type="text"
          value={formData.ordQty}
          onChange={(e) => handleInputChange("ordQty", e.target.value)}
          className={styles.input}
          placeholder="주문수량 (정수만 입력)"
          pattern="[1-9][0-9]*"
          inputMode="numeric"
          required
        />
        <small className={styles.helpText}>
          * 해외 주식도 1주 단위로만 거래 가능합니다
        </small>
      </div>

      {requiresPrice && (
        <div className={styles.formGroup}>
          <label htmlFor="ordUnpr" className={styles.label}>
            주문단가 (USD)
          </label>
          <input
            id="ordUnpr"
            type="number"
            value={formData.ordUnpr}
            onChange={(e) => handleInputChange("ordUnpr", e.target.value)}
            className={styles.input}
            placeholder="주문단가"
            min="0.01"
            step="0.01"
            required
          />
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="ordCndt" className={styles.label}>
          주문조건
        </label>
        <select
          id="ordCndt"
          value={formData.ordCndt}
          onChange={(e) => handleInputChange("ordCndt", e.target.value)}
          className={styles.select}
          required
        >
          {OVERSEAS_ORDER_CONDITIONS.map((condition) => (
            <option key={condition.value} value={condition.value}>
              {condition.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="orderMode" className={styles.label}>
          주문모드
        </label>
        <select
          id="orderMode"
          value={formData.orderMode}
          onChange={(e) =>
            handleInputChange(
              "orderMode",
              e.target.value as "immediate" | "scheduled"
            )
          }
          className={styles.select}
          required
        >
          <option value="immediate">즉시주문</option>
          <option value="scheduled">예약주문</option>
        </select>
      </div>

      {formData.orderMode === "scheduled" && (
        <div className={styles.formGroup}>
          <label htmlFor="scheduledTime" className={styles.label}>
            예약시간
          </label>
          <input
            id="scheduledTime"
            type="datetime-local"
            value={formData.scheduledExecutionTime || ""}
            onChange={(e) =>
              handleInputChange("scheduledExecutionTime", e.target.value)
            }
            className={styles.input}
            required
          />
        </div>
      )}

      <button
        type="submit"
        className={`${styles.submitButton} ${isLoading ? styles.loading : ""}`}
        disabled={isLoading}
      >
        {isLoading ? "주문 처리 중..." : "주문하기"}
      </button>
    </form>
  );
};

export default OverseasStockOrderForm;
