import { OverseasPeriodPriceResponse } from "@/types/domains/stock/overseas";

export class OverseasPriceFormatter {
  static format(price: number): string {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  static formatVolume(volume: number): string {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat("en-US").format(volume);
  }
}

export class OverseasChangeIndicator {
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
    const price = OverseasPriceFormatter.format(priceChange);
    const rate = changeRate > 0 ? "+" : "";
    return `${prefix}$${price} (${rate}${changeRate.toFixed(2)}%)`;
  }
}

export class OverseasSummaryData {
  constructor(private data: OverseasPeriodPriceResponse) {}

  get items() {
    return [
      {
        label: "현재가",
        value: `$${OverseasPriceFormatter.format(this.data.currentPrice)}`,
        className: "value",
      },
      {
        label: "전일대비",
        value: OverseasChangeIndicator.formatChange(
          this.data.priceChange,
          this.data.changeRate
        ),
        className: `value ${OverseasChangeIndicator.getColor(
          this.data.changeSign
        )}`,
      },
      {
        label: "총거래량",
        value: OverseasPriceFormatter.formatVolume(this.data.totalVolume),
        className: "value",
      },
      {
        label: "총거래대금",
        value: `$${OverseasPriceFormatter.formatVolume(
          this.data.totalTradingValue
        )}`,
        className: "value",
      },
    ];
  }
}
