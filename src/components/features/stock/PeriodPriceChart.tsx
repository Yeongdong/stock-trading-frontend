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
  }, [stockCode, fetchPeriodPrice, clearData]);

  const chartData = useMemo(() => {
    if (!data?.priceData) return [];
    return ChartDataProcessor.transformToChartData(data.priceData);
  }, [data?.priceData]);

  const chartSetup = useMemo(() => {
    if (chartData.length === 0) return null;

    console.log("🔍 Setting up chart with", chartData.length, "data points");
    console.log(
      "🔍 First 3 dates:",
      chartData.slice(0, 3).map((d) => ({
        date: d.date,
        toString: d.date.toString(),
        getTime: d.date.getTime(),
      }))
    );

    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      (d: ChartData) => d.date
    );

    const {
      data: chartDataWithX,
      xScale,
      xAccessor,
      displayXAccessor,
    } = xScaleProvider(chartData);

    const start = xAccessor(chartDataWithX[0]);
    const end = xAccessor(chartDataWithX[chartDataWithX.length - 1]);
    const xExtents = [start, end] as [number, number];

    console.log("🔍 Chart setup complete:", {
      dataPoints: chartDataWithX.length,
      xExtents,
      firstDate: chartDataWithX[0]?.date,
      lastDate: chartDataWithX[chartDataWithX.length - 1]?.date,
    });

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
    console.log("Form Submit:", formData);
    setFormData(formData);
    await fetchPeriodPrice(formData);
  };

  const createTickFormatter = () => {
    return (value: Date | number) => {
      console.log("🔍 [TickFormatter] Input:", value, typeof value);

      try {
        let date: Date;

        if (value instanceof Date) {
          date = value;
        } else if (typeof value === "number") {
          // xScale의 역변환 사용
          if (chartSetup?.xScale) {
            const invertedDate = chartSetup.xScale.invert(value);
            console.log("🔍 [TickFormatter] Inverted:", invertedDate);
            date =
              invertedDate instanceof Date
                ? invertedDate
                : new Date(invertedDate);
          } else {
            // 폴백: 숫자를 밀리초로 간주
            date = new Date(value);
          }
        } else {
          date = new Date(value);
        }

        console.log("🔍 [TickFormatter] Final date:", date, date.toString());

        if (isNaN(date.getTime())) {
          return "Invalid";
        }

        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const result = `${month}/${day}`;

        console.log("🔍 [TickFormatter] Result:", result);
        return result;
      } catch (error) {
        console.error("🔍 [TickFormatter] Error:", error);
        return "Error";
      }
    };
  };

  // const getDateFormatter = () => {
  //   const period = formData.periodDivCode;
  //   switch (period) {
  //     case "D": // 일봉 - 월/일
  //       return timeFormat("%m/%d");
  //     case "W": // 주봉 - 월/일
  //       return timeFormat("%m/%d");
  //     case "M": // 월봉 - 년/월
  //       return timeFormat("%Y/%m");
  //     case "Y": // 년봉 - 년
  //       return timeFormat("%Y");
  //     default:
  //       return timeFormat("%m/%d");
  //   }
  // };

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
                  tickFormat={createTickFormatter()}
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
