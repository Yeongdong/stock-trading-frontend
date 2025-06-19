"use client";

import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { ChartData, VolumeData } from "@/utils/dataProcessor";

/**
 * 차트 관리 클래스
 * LightWeight Charts 라이브러리 래핑
 */
export class ChartManager {
  private chart: IChartApi | null = null;
  private candlestickSeries: ISeriesApi<"Candlestick"> | null = null;
  private volumeSeries: ISeriesApi<"Histogram"> | null = null;
  private container: HTMLDivElement | null = null;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.initializeChart();
  }

  private initializeChart(): void {
    if (!this.container) {
      console.warn("Chart container not provided");
      return;
    }

    try {
      this.chart = createChart(this.container, {
        width: this.container.clientWidth,
        height: 500,
        autoSize: true,
        layout: {
          background: { color: "#ffffff" },
          textColor: "#333333",
        },
        grid: {
          vertLines: { color: "#f0f0f0" },
          horzLines: { color: "#f0f0f0" },
        },
        rightPriceScale: {
          borderVisible: false,
          scaleMargins: {
            top: 0.1,
            bottom: 0.3,
          },
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 0,
        },
      });

      this.candlestickSeries = this.chart.addSeries(CandlestickSeries, {
        upColor: "#ef4444",
        downColor: "#3b82f6",
        borderUpColor: "#dc2626",
        borderDownColor: "#2563eb",
        wickUpColor: "#dc2626",
        wickDownColor: "#2563eb",
      });

      this.volumeSeries = this.chart.addSeries(HistogramSeries, {
        color: "#64748b",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
      });

      this.volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });
    } catch (error) {
      console.error("Chart initialization failed:", error);
    }
  }

  public updateData(chartData: ChartData[], volumeData: VolumeData[]): void {
    try {
      if (!this.candlestickSeries || !this.volumeSeries) {
        console.warn("Chart series not initialized");
        return;
      }

      if (!Array.isArray(chartData) || !Array.isArray(volumeData)) {
        console.warn("Invalid chart data format");
        return;
      }

      this.candlestickSeries.setData(chartData);
      this.volumeSeries.setData(volumeData);
    } catch (error) {
      console.error("Chart data update failed:", error);
    }
  }

  public destroy(): void {
    try {
      if (this.chart) {
        this.chart.remove();
        this.chart = null;
        this.candlestickSeries = null;
        this.volumeSeries = null;
      }
    } catch (error) {
      console.error("Chart destruction failed:", error);
    }
  }

  public isInitialized(): boolean {
    return this.chart !== null;
  }
}
