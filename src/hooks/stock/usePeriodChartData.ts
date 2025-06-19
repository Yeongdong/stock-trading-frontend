import { useMemo } from "react";
import { PeriodPriceResponse } from "@/types/domains/stock/price";
import { ProcessedChartData, DataProcessor } from "@/utils/dataProcessor";
import { SummaryData } from "@/components/features/stock/chart/PeriodPriceChartModel";
import { UsePeriodChartDataResult } from "@/types/domains/stock/hooks";

export const usePeriodChartData = (
  data: PeriodPriceResponse | null
): UsePeriodChartDataResult => {
  const processedData = useMemo((): ProcessedChartData | null => {
    if (!data?.priceData?.length) return null;

    try {
      const processed = DataProcessor.formatChartData(data.priceData);
      const validation = DataProcessor.validateProcessedData(processed);

      if (!validation.isValid) {
        console.error("데이터 처리 오류:", validation.errors);
        return null;
      }

      return processed;
    } catch (error) {
      console.error("차트 데이터 처리 중 오류:", error);
      return null;
    }
  }, [data?.priceData]);

  const summaryData = useMemo((): SummaryData | null => {
    if (!data) return null;

    try {
      return new SummaryData(data);
    } catch (error) {
      console.error("요약 데이터 생성 중 오류:", error);
      return null;
    }
  }, [data]);

  const hasValidData = useMemo(() => {
    return !!(processedData && summaryData);
  }, [processedData, summaryData]);

  return {
    processedData,
    summaryData,
    hasValidData,
  };
};
