"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

import { PeriodPriceRequest } from "@/types/stock/price";
import { usePeriodPrice } from "@/hooks/stock/usePeriodPrice";
import { PeriodPriceForm } from "./PeriodPriceForm";
import { PeriodPriceSummary } from "./PeriodPriceSummary";
import { ProcessedChartData, DataProcessor } from "@/utils/dataProcessor";
import { FormManager } from "@/utils/formManager";
import { SummaryData } from "./PeriodPriceChartModel";
import styles from "./PeriodPriceChart.module.css";
import { ChartManager } from "@/services/chart/chartManager";

interface PeriodChartProps {
  stockCode: string;
  stockName?: string;
}

export default function PeriodChart({
  stockCode,
  stockName,
}: PeriodChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager | null>(null);
  const { data, loading, error, fetchPeriodPrice, clearData } =
    usePeriodPrice();

  const [formData, setFormData] = useState<PeriodPriceRequest>(() =>
    FormManager.getDefaultRequest(stockCode)
  );

  const processedData = useMemo((): ProcessedChartData | null => {
    if (!data?.priceData?.length) return null;

    const processed = DataProcessor.formatChartData(data.priceData);
    const validation = DataProcessor.validateProcessedData(processed);

    if (!validation.isValid) {
      console.error("데이터 처리 오류:", validation.errors);
      return null;
    }

    return processed;
  }, [data?.priceData]);

  const summaryData = useMemo((): SummaryData | null => {
    if (!data) return null;

    return new SummaryData(data);
  }, [data]);

  useEffect(() => {
    if (chartContainerRef.current && !chartManagerRef.current) {
      chartManagerRef.current = new ChartManager(chartContainerRef.current);
    }

    return () => {
      if (chartManagerRef.current) {
        chartManagerRef.current.destroy();
        chartManagerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const newFormData = FormManager.getDefaultRequest(stockCode);
    setFormData(newFormData);

    if (stockCode) {
      clearData();
      fetchPeriodPrice(newFormData);
    }
  }, [stockCode, fetchPeriodPrice, clearData]);

  useEffect(() => {
    if (processedData && chartManagerRef.current) {
      chartManagerRef.current.updateData(
        processedData.chartData,
        processedData.volumeData
      );
    }
  }, [processedData]);

  const handleFormSubmit = async (
    newFormData: PeriodPriceRequest
  ): Promise<void> => {
    const validation = FormManager.validateRequest(newFormData);

    if (!validation.isValid) {
      console.error("폼 검증 실패:", validation.errors);
      return;
    }

    setFormData(newFormData);
    await fetchPeriodPrice(newFormData);
  };

  const getTitle = (): string => {
    return stockName ? `${stockName} (${stockCode})` : stockCode;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{getTitle()} 기간별 시세</h2>
      </header>

      <PeriodPriceForm
        initialData={formData}
        loading={loading}
        onSubmit={handleFormSubmit}
      />

      {error && <div className={styles.error}>{error}</div>}

      {summaryData && <PeriodPriceSummary summaryData={summaryData} />}

      <div className={styles.chartContainer}>
        <div
          ref={chartContainerRef}
          style={{ width: "100%", height: "500px" }}
        />
      </div>
    </div>
  );
}
