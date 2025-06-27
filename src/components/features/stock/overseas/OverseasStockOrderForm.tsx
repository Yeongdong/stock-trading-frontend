import React, { useState, useEffect, useCallback } from "react";
import { useOverseasStockOrder } from "@/hooks/stock/useOverseasStockOrder";
import styles from "../order/StockOrderForm.module.css";
import {
  OVERSEAS_TRADE_TYPES,
  OVERSEAS_ORDER_DIVISIONS,
  OVERSEAS_ORDER_CONDITIONS,
  MARKET_TO_EXCHANGE_CODE,
  OverseasOrderFormData,
  ORDER_MODE_OPTIONS,
  getScheduledOrderGuide,
  getMarketName,
} from "@/types/domains/stock/overseas-order";

interface OverseasStockOrderFormProps {
  selectedStockCode?: string;
  initialStockCode?: string;
  initialMarket?: string;
  onOrderSuccess?: () => void;
}

const OverseasStockOrderForm: React.FC<OverseasStockOrderFormProps> = ({
  selectedStockCode,
  initialStockCode,
  initialMarket,
  onOrderSuccess,
}) => {
  const { isLoading, submitOrder } = useOverseasStockOrder();

  const [formData, setFormData] = useState<OverseasOrderFormData>({
    pdno: selectedStockCode || initialStockCode || "",
    ovsExcgCd: getExchangeCodeFromMarket(initialMarket) || "NASD",
    trId: "VTTT1002U",
    ordDvsn: "00",
    ordQty: "",
    ordUnpr: "",
    ordCndt: "DAY",
    orderMode: "immediate", // 기본값: 즉시주문
  });

  const selectedOrderDivision = OVERSEAS_ORDER_DIVISIONS.find(
    (division) => division.value === formData.ordDvsn
  );
  const requiresPrice = selectedOrderDivision?.requiresPrice ?? true;

  useEffect(() => {
    if (selectedStockCode) {
      setFormData((prev) => ({ ...prev, pdno: selectedStockCode }));
    } else if (initialStockCode) {
      setFormData((prev) => ({ ...prev, pdno: initialStockCode }));
    }
  }, [selectedStockCode, initialStockCode]);

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
          ordUnpr: "",
          scheduledExecutionTime: undefined,
        }));

        onOrderSuccess?.();
      }
    },
    [formData, submitOrder, onOrderSuccess]
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
    <div className={styles.stockOrderForm}>
      <div className={styles.formHeader}>
        <h2>해외 주식 주문</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset className={styles.fieldset}>
          <legend>주문 정보</legend>

          {/* 주문 모드 선택 */}
          <div className={styles.formGroup}>
            <label>주문 타입</label>
            <div className={styles.radioGroup}>
              {ORDER_MODE_OPTIONS.map((option) => (
                <label key={option.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="orderMode"
                    value={option.value}
                    checked={formData.orderMode === option.value}
                    onChange={(e) =>
                      handleInputChange("orderMode", e.target.value)
                    }
                    disabled={isLoading}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* 예약주문 안내 */}
          {formData.orderMode === "scheduled" && (
            <div className={styles.infoBox}>
              <h4>📅 {getMarketName(formData.ovsExcgCd)} 예약주문 안내</h4>
              <p>{getScheduledOrderGuide(formData.ovsExcgCd)}</p>
              <small>※ 예약주문은 지정가만 가능하며, 당일 유효합니다.</small>
            </div>
          )}

          {/* 거래소 선택 */}
          <div className={styles.formGroup}>
            <label htmlFor="ovsExcgCd">거래소</label>
            <select
              id="ovsExcgCd"
              value={formData.ovsExcgCd}
              onChange={(e) => handleInputChange("ovsExcgCd", e.target.value)}
              className={styles.select}
              disabled={isLoading}
            >
              {Object.entries(MARKET_TO_EXCHANGE_CODE).map(([market, code]) => (
                <option key={code} value={code}>
                  {getExchangeLabel(market, code)}
                </option>
              ))}
            </select>
            <div className={styles.helperText}>
              거래 통화: {getCurrencySymbol(formData.ovsExcgCd)}
            </div>
          </div>

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

          {/* 매매구분 */}
          <div className={styles.formGroup}>
            <label htmlFor="trId">매매 구분</label>
            <select
              id="trId"
              value={formData.trId}
              onChange={(e) =>
                handleInputChange(
                  "trId",
                  e.target.value as "VTTT1002U" | "VTTT1001U"
                )
              }
              className={styles.select}
              disabled={isLoading}
            >
              {OVERSEAS_TRADE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* 주문구분 */}
          <div className={styles.formGroup}>
            <label htmlFor="ordDvsn">주문 구분</label>
            <select
              id="ordDvsn"
              value={formData.ordDvsn}
              onChange={(e) => handleInputChange("ordDvsn", e.target.value)}
              className={styles.select}
              disabled={isLoading || formData.orderMode === "scheduled"} // 예약주문은 지정가만
            >
              {OVERSEAS_ORDER_DIVISIONS.filter(
                (division) =>
                  formData.orderMode === "immediate" || division.value === "00"
              ).map((division) => (
                <option key={division.value} value={division.value}>
                  {division.label}
                </option>
              ))}
            </select>
            {formData.orderMode === "scheduled" && (
              <small className={styles.helperText}>
                예약주문은 지정가만 가능합니다
              </small>
            )}
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
              <label htmlFor="ordUnpr">주문 단가</label>
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
            {isLoading
              ? "주문 처리 중..."
              : formData.orderMode === "immediate"
              ? "즉시 주문"
              : "예약 주문"}
          </button>
        </fieldset>
      </form>
    </div>
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

function getExchangeLabel(market: string, code: string): string {
  const labels: Record<string, string> = {
    nasdaq: "나스닥",
    nyse: "뉴욕증권거래소",
    tokyo: "도쿄증권거래소",
    london: "런던증권거래소",
    hongkong: "홍콩증권거래소",
  };
  return labels[market] || code;
}

export default OverseasStockOrderForm;
