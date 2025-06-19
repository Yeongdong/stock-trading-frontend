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
  const { isLoading, submitOrder } = useStockOrder();

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
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

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
    [formData, submitOrder, selectedStockCode, onOrderSuccess]
  );

  return (
    <div className={styles.stockOrderForm}>
      <div className={styles.formHeader}>
        <h2>주식 주문</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset className={styles.fieldset}>
          <legend>주문 정보</legend>

          <div className={styles.formGroup}>
            <label htmlFor="stockCode">종목 코드</label>
            <input
              id="stockCode"
              type="text"
              value={formData.stockCode}
              onChange={(e) => handleInputChange("stockCode", e.target.value)}
              placeholder="6자리 종목 코드 (예: 005930)"
              maxLength={6}
              pattern="[0-9]*"
              className={styles.input}
              disabled={isLoading}
              required
            />
            <div className={styles.helperText}>
              삼성전자: 005930, SK하이닉스: 000660
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="orderType">주문 구분</label>
            <select
              id="orderType"
              value={formData.orderType}
              onChange={(e) => handleInputChange("orderType", e.target.value)}
              className={styles.select}
              disabled={isLoading}
            >
              {ORDER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="quantity">주문 수량</label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              placeholder="주문 수량"
              className={styles.input}
              disabled={isLoading}
              required
            />
          </div>

          {requiresPrice && (
            <div className={styles.formGroup}>
              <label htmlFor="price">주문 단가</label>
              <input
                id="price"
                type="number"
                min="1"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="주문 단가"
                className={styles.input}
                disabled={isLoading}
                required={requiresPrice}
              />
              <div className={styles.helperText}>원 단위로 입력해주세요</div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !formData.stockCode || !formData.quantity}
            className={styles.orderButton}
          >
            {isLoading ? "주문 처리 중..." : "주문 실행"}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default StockOrderForm;
