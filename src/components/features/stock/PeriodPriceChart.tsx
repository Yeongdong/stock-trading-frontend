"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { CandlestickSeries, BarSeries } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts";
import {
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
} from "react-financial-charts";
import { discontinuousTimeScaleProvider } from "react-financial-charts";
import { timeFormat } from "d3-time-format";
import { PeriodPriceRequest } from "../../../types/stock/price";
import { usePeriodPrice } from "../../../hooks/stock/usePeriodPrice";
import styles from "./PeriodPriceChart.module.css";

import {
  ChartConfig,
  ChartData,
  ChartDataProcessor,
  DateFormatter,
  PriceFormatter,
  SummaryData,
} from "./PeriodPriceChartModel";
import { PeriodPriceForm } from "./PeriodPriceForm";
import { PeriodPriceSummary } from "./PeriodPriceSummary";

interface PeriodPriceChartProps {
  stockCode: string;
  stockName?: string;
}

export default function PeriodPriceChart({
  stockCode,
  stockName,
}: PeriodPriceChartProps) {
  const { data, loading, error, fetchPeriodPrice, clearData } =
    usePeriodPrice();
  const [formData, setFormData] = useState<PeriodPriceRequest>({
    stockCode,
    periodDivCode: "D",
    startDate: DateFormatter.getDefaultStartDate(),
    endDate: DateFormatter.getDefaultEndDate(),
    orgAdjPrc: "0",
    marketDivCode: "J",
  });
  useEffect(() => {
    console.log("Hook State:", { data, loading, error });
  }, [data, loading, error]);
  useEffect(() => {
    if (data) {
      console.log("Period Price Data:", data);
      console.log("Price Data Array:", data.priceData);
      console.log("Price Data Length:", data.priceData?.length);
    }
  }, [data]);
  useEffect(() => {
    setFormData((prev) => ({ ...prev, stockCode }));
  }, [stockCode]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, stockCode }));

    if (stockCode) {
      clearData();

      fetchPeriodPrice({
        stockCode,
        periodDivCode: "D",
        startDate: DateFormatter.getDefaultStartDate(),
        endDate: DateFormatter.getDefaultEndDate(),
        orgAdjPrc: "0",
        marketDivCode: "J",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockCode]);

  const chartData = useMemo(() => {
    if (!data?.priceData) return [];
    return ChartDataProcessor.transformToChartData(data.priceData);
  }, [data?.priceData]);

  const chartSetup = useMemo(() => {
    if (chartData.length === 0) return null;

    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      (d: ChartData) => d.date
    );
    const {
      data: chartDataWithX,
      xScale,
      xAccessor,
      displayXAccessor,
    } = xScaleProvider(chartData);
    const xExtents = ChartDataProcessor.getXExtents(chartDataWithX, xAccessor);

    return {
      chartDataWithX,
      xScale,
      xAccessor,
      displayXAccessor,
      xExtents,
    };
  }, [chartData]);

  const summaryData = useMemo(() => {
    return data ? new SummaryData(data) : null;
  }, [data]);

  const handleFormSubmit = async (formData: PeriodPriceRequest) => {
    console.log("Form Submit with data:", formData);
    setFormData(formData);
    await fetchPeriodPrice(formData);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {stockName ? `${stockName} (${stockCode})` : stockCode} 기간별 시세
        </h2>
      </header>

      <PeriodPriceForm
        initialData={formData}
        loading={loading}
        onSubmit={handleFormSubmit}
      />

      {error && <div className={styles.error}>{error}</div>}

      {summaryData && <PeriodPriceSummary summaryData={summaryData} />}

      {chartSetup && (
        <div className={styles.chartContainer}>
          <div className={styles.priceChartSection}>
            <h3>가격 차트</h3>
            <ChartCanvas
              height={ChartConfig.CHART_HEIGHT}
              width={ChartConfig.CHART_WIDTH}
              ratio={ChartConfig.CHART_RATIO}
              margin={ChartConfig.MARGIN}
              data={chartSetup.chartDataWithX}
              seriesName="OHLC"
              xScale={chartSetup.xScale}
              xAccessor={chartSetup.xAccessor}
              displayXAccessor={chartSetup.displayXAccessor}
              xExtents={chartSetup.xExtents}
            >
              <Chart id={1} yExtents={(d: ChartData) => [d.high, d.low]}>
                <XAxis
                  axisAt="bottom"
                  orient="bottom"
                  tickFormat={timeFormat("%m/%d")}
                />
                <YAxis
                  axisAt="right"
                  orient="right"
                  tickFormat={PriceFormatter.format}
                />

                <MouseCoordinateY
                  at="right"
                  orient="right"
                  displayFormat={PriceFormatter.format}
                />
                <MouseCoordinateX
                  at="bottom"
                  orient="bottom"
                  displayFormat={timeFormat("%Y/%m/%d")}
                />

                <CandlestickSeries
                  fill={(d: ChartData) =>
                    ChartConfig.getCandlestickColors(d).fill
                  }
                  stroke={(d: ChartData) =>
                    ChartConfig.getCandlestickColors(d).stroke
                  }
                  wickStroke={(d: ChartData) =>
                    ChartConfig.getCandlestickColors(d).wickStroke
                  }
                />
              </Chart>

              <Chart
                id={2}
                height={ChartConfig.VOLUME_HEIGHT}
                yExtents={(d: ChartData) => d.volume}
                origin={(w: number, h: number) => [
                  0,
                  h - ChartConfig.VOLUME_HEIGHT,
                ]}
              >
                <YAxis
                  axisAt="left"
                  orient="left"
                  tickFormat={PriceFormatter.formatVolume}
                />
                <BarSeries
                  yAccessor={(d: ChartData) => d.volume}
                  fillStyle={ChartConfig.VOLUME_BAR_COLOR}
                />
              </Chart>

              <CrossHairCursor />
            </ChartCanvas>
          </div>
        </div>
      )}
    </div>
  );
}
