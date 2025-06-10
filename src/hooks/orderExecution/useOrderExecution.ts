import { useError } from "@/contexts/ErrorContext";
import { orderExecutionService } from "@/services/api/orderExecution/orderExecutionService";
import {
  OrderExecutionInquiryRequest,
  OrderExecutionInquiryResponse,
} from "@/types/order/execution";
import { useCallback, useState } from "react";

export const useOrderExecution = () => {
  const [data, setData] = useState<OrderExecutionInquiryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const fetchOrderExecutions = useCallback(
    async (request: OrderExecutionInquiryRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await orderExecutionService.getOrderExecutions(
          request
        );

        if (response.error) throw new Error(response.error);

        if (!response.data)
          throw new Error("주문체결내역 데이터를 받지 못했습니다.");

        setData(response.data);

        addError({
          message: `주문체결내역 조회 완료: 총 ${response.data.totalCount}건`,
          severity: "info",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "주문체결내역 조회 중 오류가 발생했습니다.";

        setError(errorMessage);
        addError({
          message: errorMessage,
          severity: "error",
        });
        console.error("Order execution inquiry error:", err);
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
