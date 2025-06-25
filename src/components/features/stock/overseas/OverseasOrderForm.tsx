import React, { useState, useEffect, useCallback } from "react";
import { useOverseasStockOrder } from "@/hooks/stock/useOverseasStockOrder";
import {
  OVERSEAS_MARKETS,
  OverseasMarket,
} from "@/types/domains/stock/overseas";
import {
  OverseasOrderFormData,
  MARKET_TO_EXCHANGE_CODE,
  OVERSEAS_TRADE_TYPES,
  OVERSEAS_ORDER_DIVISIONS,
  OVERSEAS_ORDER_CONDITIONS,
} from "@/types/domains/stock/overseas-order";
import styles from "./OverseasOrderForm.module.css";

interface OverseasOrderFormProps {
  initialStockCode?: string;
  initialMarket?: OverseasMarket;
  onOrderSuccess?: () => void;
}

const OverseasOrderForm: React.FC<OverseasOrderFormProps> = ({
  initialStockCode = "",
  initialMarket = "nasdaq",
  onOrderSuccess,
}) => {
  const { isLoading, submitOrder } = useOverseasStockOrder();

  const [formData, setFormData] = useState<OverseasOrderFormData>({
    pdno: initialStockCode,
    ovsExcgCd: MARKET_TO_EXCHANGE_CODE[initialMarket],
    trId: "VTTT1002U",
    ordDvsn: "00",
    ordQty: "",
    ordUnpr: "",
    ordCndt: "DAY",
  });

  const selectedOrderDivision = OVERSEAS_ORDER_DIVISIONS.find(
    (div) => div.value === formData.ordDvsn
  );
  const requiresPrice = selectedOrderDivision?.requiresPrice ?? true;

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      pdno: initialStockCode,
      ovsExcgCd: MARKET_TO_EXCHANGE_CODE[initialMarket],
    }));
  }, [initialStockCode, initialMarket]);

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
        }));
        onOrderSuccess?.();
      }
    },
    [formData, submitOrder, onOrderSuccess]
  );

  const getCurrentMarket = (): OverseasMarket => {
    const entry = Object.entries(MARKET_TO_EXCHANGE_CODE).find(
      ([, code]) => code === formData.ovsExcgCd
    );
    return (entry?.[0] as OverseasMarket) || "nasdaq";
  };

  const getStockCodePlaceholder = () => {
    const market = getCurrentMarket();
    const examples = {
      nasdaq: "AAPL, MSFT, GOOGL",
      nyse: "AAPL, MSFT, GOOGL",
      tokyo: "7203, 6758, 9984",
      london: "LLOY, BP, ULVR",
      hongkong: "0700, 0941, 0388",
    };
    return `예: ${examples[market]}`;
  };

  const selectedTradeType = OVERSEAS_TRADE_TYPES.find(
    (type) => type.value === formData.trId
  );

  const currentMarket = getCurrentMarket();
  const marketInfo = OVERSEAS_MARKETS[currentMarket];

  return (
    <div className={styles.overseasOrderForm}>
      <div className={styles.formHeader}>
        <h2>주식 주문</h2>
        <div className={styles.marketInfo}>
          <span className={styles.marketName}>{marketInfo.name}</span>
          <span className={styles.currency}>({marketInfo.currency})</span>
        </div>
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
                  {OVERSEAS_MARKETS[market as OverseasMarket].name}
                </option>
              ))}
            </select>
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
          </div>

          <div className={styles.formGroup}>
            <label>거래 구분</label>
            <div className={styles.tradeTypeGroup}>
              {OVERSEAS_TRADE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange("trId", type.value)}
                  className={`${styles.tradeTypeButton} ${styles[type.color]} ${
                    formData.trId === type.value ? styles.active : ""
                  }`}
                  disabled={isLoading}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="ordDvsn">주문 방법</label>
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
            {currentMarket === "tokyo" && (
              <div className={styles.helperText}>도쿄는 100주 단위로 주문</div>
            )}
          </div>

          {requiresPrice && (
            <div className={styles.formGroup}>
              <label htmlFor="ordUnpr">주문 단가</label>
              <input
                id="ordUnpr"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.ordUnpr}
                onChange={(e) => handleInputChange("ordUnpr", e.target.value)}
                placeholder="주문 단가"
                className={styles.input}
                disabled={isLoading}
                required={requiresPrice}
              />
              <div className={styles.helperText}>
                {marketInfo.currency} 단위로 입력해주세요
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="ordCndt">주문 조건</label>
            <select
              id="ordCndt"
              value={formData.ordCndt}
              onChange={(e) => handleInputChange("ordCndt", e.target.value)}
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
            className={`${styles.orderButton} ${
              styles[selectedTradeType?.color || "buy"]
            }`}
          >
            {isLoading
              ? "주문 처리 중..."
              : `${selectedTradeType?.label} 주문 실행`}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default OverseasOrderForm;
