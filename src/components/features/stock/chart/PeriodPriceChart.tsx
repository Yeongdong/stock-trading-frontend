"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { PeriodPriceRequest } from "@/types/domains/stock/price";
import { usePeriodPrice } from "@/hooks/stock/usePeriodPrice";
import { PeriodPriceForm } from "./PeriodPriceForm";
import { FormManager } from "@/utils/formManager";
import styles from "./PeriodPriceChart.module.css";
import { ChartManager } from "@/services/chart/chartManager";
import { PeriodPriceSummary } from "./PeriodPriceSummary";
import { PeriodChartProps } from "@/types";
import { usePeriodChartData } from "@/hooks/stock/usePeriodChartData";

const PeriodPriceChart: React.FC<PeriodChartProps> = ({
  stockCode,
  stockName,
}) => {
  const chartManagerRef = useRef<ChartManager | null>(null);

  const { data, loading, error, fetchPeriodPrice, clearData } =
    usePeriodPrice();
  const { processedData, summaryData, hasValidData } = usePeriodChartData(data);

  const title = stockCode
    ? stockName
      ? `${stockName} (${stockCode})`
      : stockCode
    : "기간별 시세";

  // 차트 생성
  const chartContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node && !chartManagerRef.current && node.clientWidth > 0)
      chartManagerRef.current = new ChartManager(node);
  }, []);

  // 데이터 로드
  useEffect(() => {
    if (!stockCode) return;

    clearData();
    fetchPeriodPrice(FormManager.getDefaultRequest(stockCode));
  }, [stockCode, fetchPeriodPrice, clearData]);

  // 차트 업데이트
  useEffect(() => {
    if (!hasValidData || !processedData || !chartManagerRef.current?.isReady)
      return;

    chartManagerRef.current.updateData(
      processedData.chartData,
      processedData.volumeData
    );
  }, [hasValidData, processedData]);

  // 정리
  useEffect(() => {
    return () => {
      chartManagerRef.current?.destroy();
      chartManagerRef.current = null;
    };
  }, []);

  const handleFormSubmit = useCallback(
    async (formData: PeriodPriceRequest) => {
      const validation = FormManager.validateRequest(formData);
      if (!validation.isValid) return;

      await fetchPeriodPrice(formData);
    },
    [fetchPeriodPrice]
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </header>

      <PeriodPriceForm
        initialData={FormManager.getDefaultRequest(stockCode)}
        loading={loading}
        onSubmit={handleFormSubmit}
      />

      {error && <div className={styles.error}>{error}</div>}

      {data && summaryData && <PeriodPriceSummary summaryData={summaryData} />}

      <div className={styles.chartContainer}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p>차트 데이터를 불러오는 중...</p>
          </div>
        )}

        <div
          ref={chartContainerRef}
          className={styles.chartContent}
          style={{
            width: "100%",
            height: "500px",
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.2s ease-in-out",
          }}
        />

        {!hasValidData && !loading && (
          <div className={styles.noDataMessage}>
            차트 데이터를 불러올 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PeriodPriceChart);
