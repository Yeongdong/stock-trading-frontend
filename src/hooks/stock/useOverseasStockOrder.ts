import { useCallback, useState } from "react";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import {
  OverseasOrderFormData,
  OverseasOrderResponse,
} from "@/types/domains/stock/overseas-order";

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
    if (!orderData.pdno || orderData.pdno.trim().length === 0) {
      return {
        isValid: false,
        error: "종목코드는 필수입니다.",
      };
    }

    const quantity = parseInt(orderData.ordQty);
    if (!orderData.ordQty || quantity <= 0) {
      return {
        isValid: false,
        error: "주문수량은 1 이상이어야 합니다.",
      };
    }

    // 지정가인 경우 가격 검증
    if (orderData.ordDvsn === "00") {
      const price = parseFloat(orderData.ordUnpr);
      if (!orderData.ordUnpr || price <= 0) {
        return {
          isValid: false,
          error: "지정가 주문시 가격은 필수입니다.",
        };
      }
    }

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

      // 백엔드 카멜케이스 DTO에 맞춰 요청
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
      };

      const response = await apiClient.post<OverseasOrderResponse>(
        API.TRADING.OVERSEAS_ORDER,
        orderRequest,
        {
          requiresAuth: true,
          handleError: true,
        }
      );

      setIsLoading(false);

      if (response.error) return false;

      addError({
        message: `해외 주식 주문이 성공했습니다. 주문번호: ${response.data?.orderNumber}`,
        severity: "info",
      });

      return true;
    },
    [validateOrder, addError]
  );

  return {
    isLoading,
    submitOrder,
    validateOrder,
  };
};
