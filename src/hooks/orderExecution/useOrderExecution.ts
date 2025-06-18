import { useError } from "@/contexts/ErrorContext";
import { orderExecutionService } from "@/services/api/orderExecution/orderExecutionService";
import {
  OrderExecutionInquiryRequest,
  OrderExecutionInquiryResponse,
} from "@/types/order/execution";
import { useCallback, useState } from "react";
import { ErrorHandler } from "@/utils/errorHandler";
import { ERROR_CODES } from "@/types/errors/standardError";

export const useOrderExecution = () => {
  const [data, setData] = useState<OrderExecutionInquiryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const fetchOrderExecutions = useCallback(
    async (request: OrderExecutionInquiryRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await orderExecutionService.getOrderExecutions(
          request
        );

        if (response.error) {
          const standardError = ErrorHandler.createBusinessError(
            ERROR_CODES.BUSINESS_ORDER_FAIL,
            response.error
          );
          throw standardError;
        }

        if (!response.data) {
          const standardError = ErrorHandler.createBusinessError(
            ERROR_CODES.SYSTEM_PARSING,
            "주문체결내역 데이터를 받지 못했습니다."
          );
          throw standardError;
        }

        setData(response.data);

        addError({
          message: `주문체결내역 조회 완료: 총 ${response.data.totalCount}건`,
          severity: "info",
        });
      } catch (err) {
        const standardError = ErrorHandler.standardize(err);

        setError(standardError.message);
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
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchOrderExecutions,
    clearData,
  };
};
