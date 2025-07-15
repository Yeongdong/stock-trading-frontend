import React, { useState, useEffect, useCallback } from "react";
import { useStockOrder } from "@/hooks/stock/useStockOrder";
import styles from "./StockOrderForm.module.css";
import { ORDER_TYPES } from "@/constants/order";
import { OrderFormState, StockOrderFormProps } from "@/types";

const StockOrderForm: React.FC<StockOrderFormProps> = ({
  initialData,
  selectedStockCode,
  onOrderSuccess,
}) => {
  const { isLoading, submitOrder, validateOrder } = useStockOrder();

  const [formData, setFormData] = useState<OrderFormState>({
    stockCode: initialData?.stockCode || "",
    orderType: "00",
    quantity: initialData?.maxQuantity?.toString() || "",
    price: initialData?.orderPrice?.toString() || "",
  });

  // 선택된 주문 타입 정보
  const selectedOrderType = ORDER_TYPES.find(
    (type) => type.value === formData.orderType
  );
  const requiresPrice = selectedOrderType?.requiresPrice ?? true;

  // 외부에서 종목 코드가 변경되면 폼 업데이트
  useEffect(() => {
    if (selectedStockCode) {
      setFormData((prev) => ({ ...prev, stockCode: selectedStockCode }));
    } else if (initialData?.stockCode) {
      setFormData((prev) => ({
        ...prev,
        stockCode: initialData.stockCode || "",
      }));
    }

    if (initialData?.orderPrice) {
      setFormData((prev) => ({
        ...prev,
        price: initialData.orderPrice?.toString() || "",
      }));
    }

    if (initialData?.maxQuantity) {
      setFormData((prev) => ({
        ...prev,
        quantity: initialData.maxQuantity?.toString() || "",
      }));
    }
  }, [initialData, selectedStockCode]);

  const handleInputChange = useCallback(
    (field: keyof OrderFormState, value: string) => {
      // 수량 입력 시 정수만 허용
      if (field === "quantity") {
        // 숫자와 빈 문자열만 허용
        if (value !== "" && !/^\d+$/.test(value)) {
          return; // 유효하지 않은 입력은 무시
        }
      }

      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // 클라이언트 사이드 검증
      const validation = validateOrder(formData);
      if (!validation.isValid) {
        // 에러는 useStockOrder 내부에서 처리됨
        return;
      }

      const success = await submitOrder(formData);

      if (success) {
        // 주문 성공 시 폼 초기화
        setFormData({
          stockCode: selectedStockCode || "",
          orderType: "00",
          quantity: "",
          price: "",
        });

        onOrderSuccess?.();
      }
    },
    [formData, submitOrder, validateOrder, selectedStockCode, onOrderSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className={styles.orderForm}>
      <div className={styles.formGroup}>
        <label htmlFor="stockCode" className={styles.label}>
          종목코드
        </label>
        <input
          id="stockCode"
          type="text"
          value={formData.stockCode}
          onChange={(e) => handleInputChange("stockCode", e.target.value)}
          className={styles.input}
          placeholder="종목코드 6자리"
          maxLength={6}
          pattern="[0-9]{6}"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="orderType" className={styles.label}>
          주문구분
        </label>
        <select
          id="orderType"
          value={formData.orderType}
          onChange={(e) => handleInputChange("orderType", e.target.value)}
          className={styles.select}
          required
        >
          {ORDER_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="quantity" className={styles.label}>
          주문수량 (주)
        </label>
        <input
          id="quantity"
          type="text"
          value={formData.quantity}
          onChange={(e) => handleInputChange("quantity", e.target.value)}
          className={styles.input}
          placeholder="주문수량 (정수만 입력)"
          pattern="[1-9][0-9]*"
          inputMode="numeric"
          required
        />
        <small className={styles.helpText}>
          * 주식은 1주 단위로만 거래 가능합니다
        </small>
      </div>

      {requiresPrice && (
        <div className={styles.formGroup}>
          <label htmlFor="price" className={styles.label}>
            주문단가 (원)
          </label>
          <input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            className={styles.input}
            placeholder="주문단가"
            min="1"
            step="1"
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

export default StockOrderForm;
