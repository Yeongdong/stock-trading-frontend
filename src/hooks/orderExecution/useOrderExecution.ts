import { useError } from "@/contexts/ErrorContext";
import { orderExecutionService } from "@/services/api/orderExecution/orderExecutionService";
import { useCallback, useState } from "react";
import { ErrorHandler } from "@/utils/errorHandler";
import { ERROR_CODES, StandardError } from "@/types/common/error";
import {
  OrderExecutionInquiryRequest,
  OrderExecutionInquiryResponse,
} from "@/types";

export const useOrderExecution = () => {
  const [data, setData] = useState<OrderExecutionInquiryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addError } = useError();

  const fetchOrderExecutions = useCallback(
    async (request: OrderExecutionInquiryRequest) => {
      setIsLoading(true);

      try {
        const response = await orderExecutionService.getOrderExecutions(
          request
        );

        if (response.error || !response.data) {
          const standardError: StandardError = {
            code: ERROR_CODES.BUSINESS_ORDER_FAIL,
            message: response.error ?? "주문체결내역 조회에 실패했습니다.",
            severity: "error",
          };
          throw standardError;
        }

        setData(response.data);

        addError({
          message: `주문체결내역 조회 완료: 총 ${response.data.executions.length}건`,
          severity: "info",
        });
      } catch (err) {
        const standardError = ErrorHandler.standardize(err);

        addError({
          message: standardError.message,
          code: standardError.code,
          severity: standardError.severity,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addError]
  );

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    data,
    isLoading,
    fetchOrderExecutions,
    clearData,
  };
};
