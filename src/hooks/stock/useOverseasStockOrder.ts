import { useCallback, useState } from "react";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import {
  OverseasOrderFormData,
  OverseasOrderResponse,
} from "@/types/domains/stock/overseas-order";
import { isValidStockQuantity } from "@/utils/validation";

interface UseOverseasStockOrderResult {
  isLoading: boolean;
  submitOrder: (orderData: OverseasOrderFormData) => Promise<boolean>;
  validateOrder: (orderData: OverseasOrderFormData) => {
    isValid: boolean;
    error?: string;
  };
}

export const useOverseasStockOrder = (): UseOverseasStockOrderResult => {
  const [isLoading, setIsLoading] = useState(false);
  const { addError } = useError();

  const validateOrder = useCallback((orderData: OverseasOrderFormData) => {
    // 종목 코드 검증
    if (!orderData.pdno || orderData.pdno.trim().length === 0)
      return {
        isValid: false,
        error: "종목코드는 필수입니다.",
      };

    // 수량 검증 - 정수만 허용
    if (!isValidStockQuantity(orderData.ordQty))
      return {
        isValid: false,
        error: "주문 수량은 1 이상의 정수여야 합니다.",
      };

    // 지정가인 경우 가격 검증
    if (orderData.ordDvsn === "00") {
      const price = parseFloat(orderData.ordUnpr);
      if (!orderData.ordUnpr || price <= 0)
        return {
          isValid: false,
          error: "지정가 주문시 가격은 필수입니다.",
        };
    }

    // 예약주문은 지정가만 가능
    if (orderData.orderMode === "scheduled" && orderData.ordDvsn !== "00")
      return {
        isValid: false,
        error: "예약주문은 지정가만 가능합니다.",
      };

    return { isValid: true };
  }, []);

  const submitOrder = useCallback(
    async (orderData: OverseasOrderFormData): Promise<boolean> => {
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
        const orderRequest = {
          acntPrdtCd: "01",
          ovrsExcgCd: orderData.ovsExcgCd,
          pdno: orderData.pdno,
          ordQty: orderData.ordQty,
          ovrsOrdUnpr: orderData.ordUnpr || "0",
          ordSvrDvsnCd: "0",
          ordDvsn: orderData.ordDvsn,
          ordCndt: orderData.ordCndt,
          trId: orderData.trId,
          orderMode: orderData.orderMode,
          scheduledExecutionTime: orderData.scheduledExecutionTime,
        };

        const response = await apiClient.post<OverseasOrderResponse>(
          API.TRADING.OVERSEAS_ORDER,
          orderRequest,
          {
            requiresAuth: true,
            handleError: false,
          }
        );

        if (response.error) {
          addError({
            message: response.error,
            severity: "error",
          });
          return false;
        }

        const orderType =
          orderData.orderMode === "immediate" ? "즉시주문" : "예약주문";
        addError({
          message: `해외 주식 ${orderType}이 성공했습니다. 주문번호: ${response.data?.orderNumber}`,
          severity: "info",
        });

        return true;
      } catch {
        addError({
          message: "주문 처리 중 오류가 발생했습니다.",
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
