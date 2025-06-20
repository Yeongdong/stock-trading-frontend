import { useMemo } from "react";
import { PeriodPriceResponse } from "@/types/domains/stock/price";
import { ProcessedChartData, DataProcessor } from "@/utils/dataProcessor";
import { SummaryData } from "@/components/features/stock/chart/PeriodPriceChartModel";
import { UsePeriodChartDataResult } from "@/types/domains/stock/hooks";

/**
 * 기간별 차트 데이터 처리 훅
 */
export const usePeriodChartData = (
  data: PeriodPriceResponse | null
): UsePeriodChartDataResult => {
  // 차트 데이터 처리
  const processedData = useMemo((): ProcessedChartData | null => {
    if (!data?.priceData?.length) return null;

    return DataProcessor.formatChartData(data.priceData);
  }, [data?.priceData]);

  // 요약 데이터 생성
  const summaryData = useMemo((): SummaryData | null => {
    if (!data) return null;

    return new SummaryData(data);
  }, [data]);

  // 유효한 데이터 여부 확인
  const hasValidData = useMemo((): boolean => {
    return !!(processedData && summaryData);
  }, [processedData, summaryData]);

  return {
    processedData,
    summaryData,
    hasValidData,
  };
};
