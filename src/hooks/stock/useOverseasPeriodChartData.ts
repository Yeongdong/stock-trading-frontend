import { useMemo } from "react";
import { OverseasPeriodPriceResponse } from "@/types/domains/stock/overseas";
import { ProcessedChartData, DataProcessor } from "@/utils/dataProcessor";
import { OverseasSummaryData } from "@/components/features/stock/overseas/OverseasPeriodPriceChartModel";

/**
 * 해외 주식 기간별 차트 데이터 처리 훅
 */
export const useOverseasPeriodChartData = (
  data: OverseasPeriodPriceResponse | null
) => {
  // 차트 데이터 처리
  const processedData = useMemo((): ProcessedChartData | null => {
    if (!data?.priceData?.length) return null;

    return DataProcessor.formatChartData(data.priceData);
  }, [data?.priceData]);

  // 요약 데이터 생성
  const summaryData = useMemo((): OverseasSummaryData | null => {
    if (!data) return null;

    return new OverseasSummaryData(data);
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
