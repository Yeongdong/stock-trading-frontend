import { PeriodPriceRequest } from "@/types/domains/stock/price";

export class FormManager {
  public static getDefaultRequest(stockCode: string): PeriodPriceRequest {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    return {
      stockCode,
      periodDivCode: "D",
      startDate: this.formatDate(threeMonthsAgo),
      endDate: this.formatDate(today),
      orgAdjPrc: "0",
      marketDivCode: "J",
    };
  }

  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  public static validateRequest(request: PeriodPriceRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.stockCode || request.stockCode.length !== 6) {
      errors.push("종목코드는 6자리여야 합니다.");
    }

    if (!this.isValidDate(request.startDate)) {
      errors.push("시작일이 유효하지 않습니다.");
    }

    if (!this.isValidDate(request.endDate)) {
      errors.push("종료일이 유효하지 않습니다.");
    }

    if (
      request.startDate &&
      request.endDate &&
      request.startDate > request.endDate
    ) {
      errors.push("시작일은 종료일보다 이전이어야 합니다.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isValidDate(dateStr: string): boolean {
    if (!dateStr || dateStr.length !== 8) return false;

    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6));
    const day = parseInt(dateStr.substring(6, 8));

    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  public static getDateRange(periodType: "D" | "W" | "M" | "Y"): {
    startDate: string;
    endDate: string;
  } {
    const today = new Date();
    const startDate = new Date(today);

    switch (periodType) {
      case "D":
        startDate.setMonth(today.getMonth() - 3); // 3개월
        break;
      case "W":
        startDate.setMonth(today.getMonth() - 6); // 6개월
        break;
      case "M":
        startDate.setFullYear(today.getFullYear() - 1); // 1년
        break;
      case "Y":
        startDate.setFullYear(today.getFullYear() - 5); // 5년
        break;
    }

    return {
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(today),
    };
  }
}
