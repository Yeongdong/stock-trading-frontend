"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager | null>(null);

  const { data, loading, error, fetchPeriodPrice, clearData } =
    usePeriodPrice();
  const { processedData, summaryData, hasValidData } = usePeriodChartData(data);

  const [formData, setFormData] = useState<PeriodPriceRequest>(() =>
    FormManager.getDefaultRequest(stockCode)
  );

  // 차트 매니저 초기화
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

  // 종목 코드 변경 시 데이터 갱신
  useEffect(() => {
    if (!stockCode) return;

    const newFormData = FormManager.getDefaultRequest(stockCode);
    setFormData(newFormData);
    clearData();
    fetchPeriodPrice(newFormData);
  }, [stockCode, fetchPeriodPrice, clearData]);

  // 차트 데이터 업데이트
  useEffect(() => {
    if (processedData && chartManagerRef.current) {
      chartManagerRef.current.updateData(
        processedData.chartData,
        processedData.volumeData
      );
    }
  }, [processedData]);

  const handleFormSubmit = useCallback(
    async (newFormData: PeriodPriceRequest) => {
      const validation = FormManager.validateRequest(newFormData);

      if (!validation.isValid) {
        console.error("폼 검증 실패:", validation.errors);
        return;
      }

      setFormData(newFormData);
      await fetchPeriodPrice(newFormData);
    },
    [fetchPeriodPrice]
  );

  const getTitle = useCallback((): string => {
    return stockName ? `${stockName} (${stockCode})` : stockCode;
  }, [stockCode, stockName]);

  if (!stockCode) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>종목을 선택해주세요.</p>
        </div>
      </div>
    );
  }

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

export default PeriodPriceChart;
