import { useState, useCallback } from "react";
import { stockService } from "@/services/api/stock/stockService";
import { useError } from "@/contexts/ErrorContext";
import {
  OverseasOrderFormData,
  OverseasStockOrder,
} from "@/types/domains/stock/overseas-order";

interface UseOverseasStockOrderResult {
  isLoading: boolean;
  submitOrder: (formData: OverseasOrderFormData) => Promise<boolean>;
}

export const useOverseasStockOrder = (): UseOverseasStockOrderResult => {
  const [isLoading, setIsLoading] = useState(false);
  const { addError } = useError();

  const submitOrder = useCallback(
    async (formData: OverseasOrderFormData): Promise<boolean> => {
      setIsLoading(true);

      const orderRequest: OverseasStockOrder = {
        acntPrdtCd: "01",
        trId: formData.trId,
        pdno: formData.pdno.toUpperCase(),
        ordDvsn: formData.ordDvsn,
        ordQty: formData.ordQty,
        ordUnpr: formData.ordUnpr,
        ovsExcgCd: formData.ovsExcgCd,
        ordCndt: formData.ordCndt,
      };

      const response = await stockService.placeOverseasOrder(orderRequest);
      setIsLoading(false);

      if (response.error) {
        addError({
          message: response.error,
          code: "BUSINESS_ORDER_FAIL",
          severity: "error",
        });
        return false;
      }

      if (response.data?.isSuccess) {
        addError({
          message: `해외 주식 주문이 완료되었습니다. 주문번호: ${response.data.orderNumber}`,
          code: "ORDER_SUCCESS",
          severity: "info",
        });
        return true;
      }

      addError({
        message: response.data?.message || "해외 주식 주문에 실패했습니다.",
        code: "BUSINESS_ORDER_FAIL",
        severity: "error",
      });
      return false;
    },
    [addError]
  );

  return {
    isLoading,
    submitOrder,
  };
};
