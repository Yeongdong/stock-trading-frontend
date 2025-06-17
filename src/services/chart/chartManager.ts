"use client";

import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";

interface ChartData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface VolumeData {
  time: Time;
  value: number;
  color: string;
}

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
    if (!this.container) return;

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
  }

  public updateData(chartData: ChartData[], volumeData: VolumeData[]): void {
    if (!this.candlestickSeries || !this.volumeSeries) return;

    this.candlestickSeries.setData(chartData);
    this.volumeSeries.setData(volumeData);
  }

  public destroy(): void {
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
      this.candlestickSeries = null;
      this.volumeSeries = null;
    }
  }
}
