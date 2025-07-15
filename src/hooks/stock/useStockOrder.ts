import { useCallback, useState } from "react";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import { API, ERROR_MESSAGES } from "@/constants";
import { StockOrder } from "@/types/domains/stock";
import {
  OrderFormData,
  UseStockOrderResult,
} from "@/types/domains/stock/hooks";
import { isValidStockQuantity } from "@/utils/validation";

export const useStockOrder = (): UseStockOrderResult => {
  const [isLoading, setIsLoading] = useState(false);
  const { addError } = useError();

  const validateOrder = useCallback((orderData: OrderFormData) => {
    // 종목 코드 검증
    if (!orderData.stockCode || orderData.stockCode.trim().length !== 6)
      return {
        isValid: false,
        error: ERROR_MESSAGES.ORDER.INVALID_SYMBOL,
      };

    // 수량 검증 - 정수만 허용
    if (!isValidStockQuantity(orderData.quantity))
      return {
        isValid: false,
        error: "주문 수량은 1 이상의 정수여야 합니다.",
      };

    // 지정가인 경우 가격 검증
    if (orderData.orderType.startsWith("00")) {
      const price = parseInt(orderData.price);
      if (!orderData.price || price <= 0)
        return {
          isValid: false,
          error: ERROR_MESSAGES.ORDER.INVALID_PRICE,
        };
    }

    return { isValid: true };
  }, []);

  const submitOrder = useCallback(
    async (orderData: OrderFormData): Promise<boolean> => {
      const validation = validateOrder(orderData);

      if (!validation.isValid) {
        addError({
          message: validation.error!,
          severity: "warning",
        });
        return false;
      }

      setIsLoading(true);

      try {
        const processedOrderType = orderData.orderType.substring(0, 2);

        const stockOrder: StockOrder = {
          acntPrdtCd: "01",
          trId: "VTTC0802U",
          pdno: orderData.stockCode,
          ordDvsn: processedOrderType,
          ordQty: orderData.quantity,
          ordUnpr: orderData.price,
        };

        const response = await apiClient.post(API.TRADING.ORDER, stockOrder, {
          requiresAuth: true,
          handleError: true,
        });

        if (response.error) throw new Error(response.error);

        addError({
          message: ERROR_MESSAGES.ORDER.ORDER_SUCCESS,
          severity: "info",
        });

        return true;
      } catch (error) {
        console.error("주문 실행 중 오류:", error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.ORDER.ORDER_FAILED;

        addError({
          message: errorMessage,
          severity: "error",
        });

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [validateOrder, addError]
  );

  return {
    isLoading,
    submitOrder,
    validateOrder,
  };
};
