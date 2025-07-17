import { ChartData } from "@/types";
import {
  PeriodPriceData,
  PeriodPriceResponse,
} from "@/types/domains/stock/price";

export class DateFormatter {
  static parseYYYYMMDD(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== "string" || dateStr.length !== 8)
      throw new Error(`Invalid date format: ${dateStr}`);

    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));

    if (isNaN(year) || isNaN(month) || isNaN(day))
      throw new Error(`Invalid date components: ${dateStr}`);

    const date = new Date(year, month, day, 12, 0, 0, 0);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    )
      throw new Error(`Date validation failed: ${dateStr}`);

    return date;
  }

  static toYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  static getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return this.toYYYYMMDD(date);
  }

  static getDefaultEndDate(): string {
    return this.toYYYYMMDD(new Date());
  }

  static forInput(dateStr: string): string {
    if (dateStr.length !== 8) return "";
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(
      6,
      8
    )}`;
  }

  static fromInput(dateStr: string): string {
    return dateStr.replace(/-/g, "");
  }
}

export class ChartDataProcessor {
  static transformToChartData(priceData: PeriodPriceData[]): ChartData[] {
    const transformedData = priceData
      .map((item) => {
        try {
          const date = DateFormatter.parseYYYYMMDD(item.date);

          return {
            date,
            open: item.openPrice,
            high: item.highPrice,
            low: item.lowPrice,
            close: item.closePrice,
            volume: item.volume,
          };
        } catch {
          console.warn("Invalid date data filtered:", item.date);
          return null;
        }
      })
      .filter((item): item is ChartData => {
        if (item === null) return false;

        const hasValidPrices =
          item.open > 0 &&
          item.high > 0 &&
          item.low > 0 &&
          item.close > 0 &&
          item.high >= Math.max(item.open, item.close) &&
          item.low <= Math.min(item.open, item.close);

        if (!hasValidPrices) {
          console.warn("Invalid price data filtered:", item);
          return false;
        }

        return true;
      });

    // 날짜순 정렬
    const sortedData = transformedData.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    return sortedData;
  }

  static getXExtents(
    chartData: ChartData[],
    xAccessor: (d: ChartData) => number,
    maxItems: number = 100
  ): [number, number] {
    if (chartData.length === 0) return [0, 1];

    const startIndex = Math.max(0, chartData.length - maxItems);
    const start = xAccessor(chartData[startIndex]);
    const end = xAccessor(chartData[chartData.length - 1]);

    return [start, end];
  }
}

export class PriceFormatter {
  static format(price: number): string {
    return new Intl.NumberFormat("ko-KR").format(price);
  }

  static formatVolume(volume: number): string {
    if (volume >= 100000000) {
      return `${(volume / 100000000).toFixed(1)}억`;
    } else if (volume >= 10000) {
      return `${(volume / 10000).toFixed(1)}만`;
    }
    return new Intl.NumberFormat("ko-KR").format(volume);
  }
}

export class ChangeIndicator {
  static getColor(changeSign: string): "up" | "down" | "neutral" {
    switch (changeSign) {
      case "2":
        return "up";
      case "5":
        return "down";
      default:
        return "neutral";
    }
  }

  static formatChange(priceChange: number, changeRate: number): string {
    const prefix = priceChange > 0 ? "+" : "";
    const price = PriceFormatter.format(priceChange);
    const rate = changeRate > 0 ? "+" : "";
    return `${prefix}${price}원 (${rate}${changeRate.toFixed(2)}%)`;
  }
}

export class SummaryData {
  constructor(private data: PeriodPriceResponse) {}

  get items() {
    return [
      {
        label: "현재가",
        value: `${PriceFormatter.format(this.data.currentPrice)}원`,
        className: "value",
      },
      {
        label: "전일대비",
        value: ChangeIndicator.formatChange(
          this.data.priceChange,
          this.data.changeRate
        ),
        className: `value ${ChangeIndicator.getColor(this.data.changeSign)}`,
      },
      {
        label: "총거래량",
        value: PriceFormatter.formatVolume(this.data.totalVolume),
        className: "value",
      },
      {
        label: "총거래대금",
        value: `${PriceFormatter.formatVolume(this.data.totalTradingValue)}원`,
        className: "value",
      },
    ];
  }
}

export class ChartConfig {
  static readonly CHART_HEIGHT = 400;
  static readonly VOLUME_HEIGHT = 150;
  static readonly CHART_WIDTH = 800;
  static readonly CHART_RATIO = 1;
  static readonly MARGIN = { left: 50, right: 50, top: 10, bottom: 30 };

  static getCandlestickColors(data: ChartData) {
    const isUp = data.close > data.open;
    return {
      fill: isUp ? "#ef4444" : "#3b82f6",
      stroke: isUp ? "#dc2626" : "#2563eb",
      wickStroke: isUp ? "#dc2626" : "#2563eb",
    };
  }

  static readonly VOLUME_BAR_COLOR = "#64748b";
}
