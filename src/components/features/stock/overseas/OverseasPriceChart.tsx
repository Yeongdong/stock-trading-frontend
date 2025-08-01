"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { OverseasPeriodPriceRequest } from "@/types/domains/stock/overseas";
import { useOverseasPeriodPrice } from "@/hooks/stock/useOverseasPeriodPrice";
import { OverseasPeriodPriceForm } from "./OverseasPeriodPriceForm";
import styles from "./OverseasPriceChart.module.css";
import { ChartManager } from "@/services/chart/chartManager";
import { OverseasPeriodPriceSummary } from "./OverseasPeriodPriceSummary";
import { useOverseasPeriodChartData } from "@/hooks/stock/useOverseasPeriodChartData";
import { OverseasFormManager } from "@/utils/OverseasDateFormatter";

interface OverseasPriceChartProps {
  stockCode: string;
  stockName: string;
  market: string;
}

const OverseasPriceChart: React.FC<OverseasPriceChartProps> = ({
  stockCode,
  stockName,
  market,
}) => {
  const chartManagerRef = useRef<ChartManager | null>(null);

  const { data, loading, error, fetchOverseasPeriodPrice, clearData } =
    useOverseasPeriodPrice();
  const { processedData, summaryData, hasValidData } =
    useOverseasPeriodChartData(data);

  const title = stockCode
    ? stockName
      ? `${stockName} (${stockCode})`
      : stockCode
    : "해외 주식 기간별 시세";

  // 차트 생성
  const chartContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node && !chartManagerRef.current && node.clientWidth > 0)
      chartManagerRef.current = new ChartManager(node);
  }, []);

  // 데이터 로드
  useEffect(() => {
    if (!stockCode) return;

    clearData();
    fetchOverseasPeriodPrice(OverseasFormManager.getDefaultRequest(stockCode));
  }, [stockCode, market, fetchOverseasPeriodPrice, clearData]);

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
    async (formData: OverseasPeriodPriceRequest) => {
      const validation = OverseasFormManager.validateRequest(formData);
      if (!validation.isValid) return;

      await fetchOverseasPeriodPrice(formData);
    },
    [fetchOverseasPeriodPrice]
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </header>

      <OverseasPeriodPriceForm
        initialData={OverseasFormManager.getDefaultRequest(stockCode)}
        loading={loading}
        onSubmit={handleFormSubmit}
      />

      {error && <div className={styles.error}>{error}</div>}

      {data && summaryData && (
        <OverseasPeriodPriceSummary summaryData={summaryData} />
      )}

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

export default React.memo(OverseasPriceChart);
