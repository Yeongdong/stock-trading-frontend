import { Time } from "lightweight-charts";
import { PeriodPriceData } from "@/types/domains/stock/price";

export interface ChartData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeData {
  time: Time;
  value: number;
  color: string;
}

export interface ProcessedChartData {
  chartData: ChartData[];
  volumeData: VolumeData[];
}

export class DataProcessor {
  private static readonly VALID_DATE_LENGTH = 8;
  private static readonly UP_COLOR = "#ef444480";
  private static readonly DOWN_COLOR = "#3b82f680";

  public static formatChartData(
    periodData: PeriodPriceData[]
  ): ProcessedChartData {
    if (!Array.isArray(periodData) || periodData.length === 0) {
      return { chartData: [], volumeData: [] };
    }

    const chartData: ChartData[] = [];
    const volumeData: VolumeData[] = [];

    for (const item of periodData) {
      const time = this.parseDate(item.date);

      if (!time || !this.isValidPriceData(item)) {
        continue;
      }

      chartData.push({
        time,
        open: item.openPrice,
        high: item.highPrice,
        low: item.lowPrice,
        close: item.closePrice,
      });

      const isUp = item.closePrice >= item.openPrice;
      volumeData.push({
        time,
        value: item.volume,
        color: isUp ? this.UP_COLOR : this.DOWN_COLOR,
      });
    }

    return {
      chartData: this.sortByTime(chartData),
      volumeData: this.sortByTime(volumeData),
    };
  }

  private static parseDate(dateStr: string): Time | null {
    if (!dateStr || dateStr.length !== this.VALID_DATE_LENGTH) {
      return null;
    }

    try {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);

      const date = new Date(`${year}-${month}-${day}`);

      if (isNaN(date.getTime())) {
        return null;
      }

      return `${year}-${month}-${day}` as Time;
    } catch {
      return null;
    }
  }

  private static isValidPriceData(item: PeriodPriceData): boolean {
    return (
      typeof item.openPrice === "number" &&
      typeof item.highPrice === "number" &&
      typeof item.lowPrice === "number" &&
      typeof item.closePrice === "number" &&
      typeof item.volume === "number" &&
      item.openPrice > 0 &&
      item.highPrice > 0 &&
      item.lowPrice > 0 &&
      item.closePrice > 0 &&
      item.volume >= 0 &&
      item.highPrice >= Math.max(item.openPrice, item.closePrice) &&
      item.lowPrice <= Math.min(item.openPrice, item.closePrice)
    );
  }

  private static sortByTime<T extends { time: Time }>(data: T[]): T[] {
    return data.sort((a, b) => {
      const timeA = typeof a.time === "string" ? a.time : String(a.time);
      const timeB = typeof b.time === "string" ? b.time : String(b.time);
      return timeA.localeCompare(timeB);
    });
  }

  public static getDataSummary(chartData: ChartData[]): {
    totalItems: number;
    dateRange: { start: Time | null; end: Time | null };
    priceRange: { min: number; max: number };
  } {
    if (chartData.length === 0) {
      return {
        totalItems: 0,
        dateRange: { start: null, end: null },
        priceRange: { min: 0, max: 0 },
      };
    }

    const sortedData = this.sortByTime([...chartData]);
    const prices = chartData.flatMap((item) => [item.high, item.low]);

    return {
      totalItems: chartData.length,
      dateRange: {
        start: sortedData[0].time,
        end: sortedData[sortedData.length - 1].time,
      },
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
    };
  }

  public static validateProcessedData(data: ProcessedChartData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.chartData.length !== data.volumeData.length) {
      errors.push("차트 데이터와 볼륨 데이터의 개수가 일치하지 않습니다.");
    }

    if (data.chartData.length === 0) {
      errors.push("처리된 데이터가 없습니다.");
    }

    // 시간 일치 검증
    for (
      let i = 0;
      i < Math.min(data.chartData.length, data.volumeData.length);
      i++
    ) {
      if (data.chartData[i].time !== data.volumeData[i].time) {
        errors.push(`인덱스 ${i}에서 시간이 일치하지 않습니다.`);
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
