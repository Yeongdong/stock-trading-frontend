import React, { useState, useEffect, useCallback } from "react";
import { useOverseasStockOrder } from "@/hooks/stock/useOverseasStockOrder";
import styles from "../order/StockOrderForm.module.css";
import {
  OVERSEAS_TRADE_TYPES,
  OVERSEAS_ORDER_DIVISIONS,
  MARKET_TO_EXCHANGE_CODE,
  OverseasOrderFormData,
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
  });

  // 선택된 주문 구분 정보
  const selectedOrderDivision = OVERSEAS_ORDER_DIVISIONS.find(
    (division) => division.value === formData.ordDvsn
  );
  const requiresPrice = selectedOrderDivision?.requiresPrice ?? true;

  // 외부에서 종목 코드가 변경되면 폼 업데이트
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
        // 주문 성공 시 폼 초기화 (종목코드는 유지)
        setFormData((prev) => ({
          ...prev,
          ordQty: "",
          ordUnpr: "",
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
        return "USD";
      case "TKSE":
        return "JPY";
      case "LNSE":
        return "GBP";
      case "HKEX":
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
      case "HKEX":
        return "홍콩 종목 코드 (예: 0700, 0941)";
      default:
        return "종목 코드를 입력하세요";
    }
  };

  const getHelperText = (): string => {
    switch (formData.ovsExcgCd) {
      case "NASD":
      case "NYSE":
        return "애플: AAPL, 테슬라: TSLA, 마이크로소프트: MSFT";
      case "TKSE":
        return "도요타: 7203, 소니: 6758, 소프트뱅크: 9984";
      case "LNSE":
        return "로이즈: LLOY, BP: BP, 유니레버: ULVR";
      case "HKEX":
        return "텐센트: 0700, 중국모바일: 0941, 중국석유: 0386";
      default:
        return "";
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
            <div className={styles.helperText}>{getHelperText()}</div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="trId">거래 구분</label>
            <select
              id="trId"
              value={formData.trId}
              onChange={(e) => handleInputChange("trId", e.target.value)}
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

          <div className={styles.formGroup}>
            <label htmlFor="ordDvsn">주문 구분</label>
            <select
              id="ordDvsn"
              value={formData.ordDvsn}
              onChange={(e) => handleInputChange("ordDvsn", e.target.value)}
              className={styles.select}
              disabled={isLoading}
            >
              {OVERSEAS_ORDER_DIVISIONS.map((division) => (
                <option key={division.value} value={division.value}>
                  {division.label}
                </option>
              ))}
            </select>
          </div>

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
            {isLoading ? "주문 처리 중..." : "주문 실행"}
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
    hongkong: "HKEX",
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
