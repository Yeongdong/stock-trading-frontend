"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { OverseasPeriodPriceRequest } from "@/types/domains/stock/overseas";
import { OverseasPeriodPriceForm } from "./OverseasPeriodPriceForm";
import styles from "./OverseasPriceChart.module.css";
import { ChartManager } from "@/services/chart/chartManager";
import { useOverseasPeriodPrice } from "@/hooks/stock/useOverseasPeriodPrice";
import { useOverseasPeriodChartData } from "@/hooks/stock/useOverseasPeriodChartData";
import { OverseasPeriodPriceSummary } from "./OverseasPeriodPriceSummary";
import { OverseasFormManager } from "@/utils/OverseasDateFormatter";

interface OverseasPriceChartProps {
  stockName: string;
  stockCode: string;
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
    if (!stockCode || !market) return;

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

  if (!stockCode)
    return (
      <div className={styles.emptyChart}>
        <h3>해외 주식 차트</h3>
        <p>종목을 선택하면 차트가 표시됩니다.</p>
      </div>
    );

  return (
    <div className={styles.overseasPriceChart}>
      <header className={styles.chartHeader}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.market}>{market.toUpperCase()}</span>
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

export default OverseasPriceChart;
