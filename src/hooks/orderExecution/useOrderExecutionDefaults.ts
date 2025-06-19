import { useMemo } from "react";
import { OrderExecutionInquiryRequest } from "@/types";
import { useDateUtils } from "@/hooks/common/useDateUtils";

const DEFAULT_SEARCH_PERIOD = 30; // 기본 30일

export const useOrderExecutionDefaults = () => {
  const { getTodayString, getDaysAgoString, formatDateForApi } = useDateUtils();

  const defaultSearchRequest = useMemo((): OrderExecutionInquiryRequest => {
    return {
      startDate: formatDateForApi(getDaysAgoString(DEFAULT_SEARCH_PERIOD)),
      endDate: formatDateForApi(getTodayString()),
      orderType: "00", // 전체
    };
  }, [getTodayString, getDaysAgoString, formatDateForApi]);

  const getDefaultDateRange = useMemo(
    () => ({
      startDate: getDaysAgoString(DEFAULT_SEARCH_PERIOD),
      endDate: getTodayString(),
    }),
    [getTodayString, getDaysAgoString]
  );

  return {
    defaultSearchRequest,
    getDefaultDateRange,
  };
};
