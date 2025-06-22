"use client";

import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  DeepPartial,
  ChartOptions,
} from "lightweight-charts";
import { ChartData, VolumeData } from "@/utils/dataProcessor";

interface ChartManagerConfig {
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  upColor?: string;
  downColor?: string;
  borderUpColor?: string;
  borderDownColor?: string;
  wickUpColor?: string;
  wickDownColor?: string;
  volumeColor?: string;
}

export class ChartManager {
  private chart: IChartApi | null = null;
  private candlestickSeries: ISeriesApi<"Candlestick"> | null = null;
  private volumeSeries: ISeriesApi<"Histogram"> | null = null;
  private readonly container: HTMLDivElement;
  private readonly config: Required<ChartManagerConfig>;
  private isDestroyed = false;

  private static readonly DEFAULT_CONFIG: Required<ChartManagerConfig> = {
    width: 800,
    height: 500,
    backgroundColor: "#ffffff",
    textColor: "#333333",
    upColor: "#ef4444",
    downColor: "#3b82f6",
    borderUpColor: "#dc2626",
    borderDownColor: "#2563eb",
    wickUpColor: "#dc2626",
    wickDownColor: "#2563eb",
    volumeColor: "#64748b",
  };

  constructor(container: HTMLDivElement, config?: Partial<ChartManagerConfig>) {
    this.container = container;
    this.config = { ...ChartManager.DEFAULT_CONFIG, ...config };
    this.initializeChart();
  }

  private initializeChart(): void {
    if (this.isDestroyed) return;

    this.cleanup();

    const chartOptions: DeepPartial<ChartOptions> = {
      width: this.container.clientWidth || this.config.width,
      height: this.config.height,
      autoSize: true,
      layout: {
        background: { color: this.config.backgroundColor },
        textColor: this.config.textColor,
      },
      grid: {
        vertLines: { color: "#f0f0f0" },
        horzLines: { color: "#f0f0f0" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.3 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: 0 },
    };

    this.chart = createChart(this.container, chartOptions);
    this.initializeSeries();
  }

  private initializeSeries(): void {
    if (!this.chart || this.isDestroyed) return;

    this.candlestickSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: this.config.upColor,
      downColor: this.config.downColor,
      borderUpColor: this.config.borderUpColor,
      borderDownColor: this.config.borderDownColor,
      wickUpColor: this.config.wickUpColor,
      wickDownColor: this.config.wickDownColor,
    });

    this.volumeSeries = this.chart.addSeries(HistogramSeries, {
      color: this.config.volumeColor,
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    this.volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.7, bottom: 0 },
    });
  }

  public updateData(chartData: ChartData[], volumeData: VolumeData[]): void {
    if (
      this.isDestroyed ||
      !this.isInitialized() ||
      !this.isValidData(chartData, volumeData)
    )
      return;

    this.candlestickSeries!.setData(chartData);
    this.volumeSeries!.setData(volumeData);
    this.chart!.timeScale().fitContent();
  }

  public resize(): void {
    if (this.isDestroyed || !this.chart) return;

    const rect = this.container.getBoundingClientRect();
    this.chart.applyOptions({
      width: rect.width || this.config.width,
      height: rect.height || this.config.height,
    });
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.cleanup();
  }

  private cleanup(): void {
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
      this.candlestickSeries = null;
      this.volumeSeries = null;
    }
  }

  private isInitialized(): boolean {
    return !!(this.chart && this.candlestickSeries && this.volumeSeries);
  }

  private isValidData(
    chartData: ChartData[],
    volumeData: VolumeData[]
  ): boolean {
    return (
      Array.isArray(chartData) &&
      Array.isArray(volumeData) &&
      chartData.length > 0 &&
      chartData.length === volumeData.length
    );
  }

  public get isReady(): boolean {
    return this.isInitialized() && !this.isDestroyed;
  }
}
