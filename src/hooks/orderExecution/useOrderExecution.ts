import { useState, useCallback } from "react";
import { orderExecutionService } from "@/services/api/orderExecution/orderExecutionService";
import { useDateUtils } from "@/hooks/common/useDateUtils";
import {
  OrderExecutionInquiryRequest,
  OrderExecutionInquiryResponse,
} from "@/types";

const DEFAULT_SEARCH_PERIOD = 30; // 기본 30일

export const useOrderExecution = () => {
  const [data, setData] = useState<OrderExecutionInquiryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getTodayString, getDaysAgoString, formatDateForApi } = useDateUtils();

  // 기본 검색 조건 생성
  const createDefaultRequest = useCallback((): OrderExecutionInquiryRequest => {
    return {
      startDate: formatDateForApi(getDaysAgoString(DEFAULT_SEARCH_PERIOD)),
      endDate: formatDateForApi(getTodayString()),
      orderType: "00", // 전체
    };
  }, [getTodayString, getDaysAgoString, formatDateForApi]);

  const fetchOrderExecutions = useCallback(
    async (request?: OrderExecutionInquiryRequest) => {
      const searchRequest = request || createDefaultRequest();
      setIsLoading(true);

      try {
        const response = await orderExecutionService.getOrderExecutions(
          searchRequest
        );

        if (response.data && !response.error) {
          setData(response.data);
          return response.data;
        }

        setData(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [createDefaultRequest]
  );

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    data,
    isLoading,
    fetchOrderExecutions,
    clearData,
    createDefaultRequest,
  };
};
