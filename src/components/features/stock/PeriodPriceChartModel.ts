import { PeriodPriceData, PeriodPriceResponse } from "@/types";

export interface ChartData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// export class DateFormatter {
//   static toYYYYMMDD(date: Date): string {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}${month}${day}`;
//   }

//   static forInput(dateStr: string): string {
//     if (dateStr.length !== 8) return "";
//     return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(
//       6,
//       8
//     )}`;
//   }

//   static fromInput(dateStr: string): string {
//     return dateStr.replace(/-/g, "");
//   }

//   static parseYYYYMMDD(dateStr: string): Date {
//     const year = parseInt(dateStr.slice(0, 4));
//     const month = parseInt(dateStr.slice(4, 6)) - 1;
//     const day = parseInt(dateStr.slice(6, 8));
//     return new Date(year, month, day);
//   }

//   static getDefaultStartDate(): string {
//     const date = new Date();
//     date.setMonth(date.getMonth() - 3);
//     return this.toYYYYMMDD(date);
//   }

//   static getDefaultEndDate(): string {
//     return this.toYYYYMMDD(new Date());
//   }
// }

export class DateFormatter {
  static parseYYYYMMDD(dateStr: string): Date {
    console.log("🔍 [DateFormatter] Input:", dateStr);

    if (!dateStr || typeof dateStr !== "string" || dateStr.length !== 8) {
      console.error("🔍 [DateFormatter] Invalid input:", dateStr);
      return new Date(2000, 0, 1); // 기본값
    }

    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));

    console.log("🔍 [DateFormatter] Components:", {
      year,
      month: month + 1,
      day,
    });

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      console.error("🔍 [DateFormatter] NaN components");
      return new Date(2000, 0, 1);
    }

    // 시간대 문제 해결: UTC 시간으로 생성하지 말고 로컬 시간으로 생성
    // 단, 시간을 정오(12:00)로 설정하여 시간대 변환 문제 방지
    const date = new Date(year, month, day, 12, 0, 0, 0);

    console.log("🔍 [DateFormatter] Created date:", {
      input: dateStr,
      output: date,
      getFullYear: date.getFullYear(),
      getMonth: date.getMonth() + 1,
      getDate: date.getDate(),
      toString: date.toString(),
      toDateString: date.toDateString(),
      getTime: date.getTime(),
    });

    // 검증
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      console.error("🔍 [DateFormatter] Date validation failed");
      return new Date(2000, 0, 1);
    }

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
    console.log("🔍 [ChartDataProcessor] Input:", priceData.length, "items");

    const transformedData = priceData.map((item, index) => {
      const date = DateFormatter.parseYYYYMMDD(item.date);

      const result = {
        date,
        open: item.openPrice,
        high: item.highPrice,
        low: item.lowPrice,
        close: item.closePrice,
        volume: item.volume,
      };

      // 처음 3개 아이템 로깅
      if (index < 3) {
        console.log(`🔍 [ChartDataProcessor] Item ${index}:`, {
          originalDate: item.date,
          parsedDate: date,
          month: date.getMonth() + 1,
          day: date.getDate(),
          formattedForChart: `${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}/${String(date.getDate()).padStart(2, "0")}`,
        });
      }

      return result;
    });

    const validData = transformedData.filter((item) => {
      const isValid =
        !isNaN(item.date.getTime()) && item.date.getFullYear() > 1900;
      if (!isValid) {
        console.warn(
          "🔍 [ChartDataProcessor] Invalid date filtered:",
          item.date
        );
      }
      return isValid;
    });

    const sortedData = validData.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    console.log("🔍 [ChartDataProcessor] Result:", {
      input: priceData.length,
      valid: validData.length,
      final: sortedData.length,
      firstDate: sortedData[0]?.date,
      lastDate: sortedData[sortedData.length - 1]?.date,
    });

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

// export class ChartDataProcessor {
//   static transformToChartData(priceData: PeriodPriceData[]): ChartData[] {
//     return priceData
//       .map((item) => ({
//         date: DateFormatter.parseYYYYMMDD(item.date),
//         open: item.openPrice,
//         high: item.highPrice,
//         low: item.lowPrice,
//         close: item.closePrice,
//         volume: item.volume,
//       }))
//       .sort((a, b) => a.date.getTime() - b.date.getTime());
//   }

//   static getXExtents(
//     chartData: ChartData[],
//     xAccessor: (d: ChartData) => number,
//     maxItems: number = 100
//   ): [number, number] {
//     const startIndex = Math.max(0, chartData.length - maxItems);
//     const start = xAccessor(chartData[startIndex]);
//     const end = xAccessor(chartData[chartData.length - 1]);
//     return [start, end];
//   }
// }

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
