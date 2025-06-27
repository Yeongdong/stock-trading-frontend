import { OverseasPeriodPriceRequest } from "@/types/domains/stock/overseas";

export class OverseasFormManager {
  /**
   * 기본 요청 데이터 생성
   */
  static getDefaultRequest(stockCode: string): OverseasPeriodPriceRequest {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3); // 3개월 전

    return {
      stockCode: stockCode || "",
      marketDivCode: "N", // 해외지수로 고정
      periodDivCode: "D",
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    };
  }

  /**
   * 요청 데이터 검증
   */
  static validateRequest(request: OverseasPeriodPriceRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (!request.stockCode?.trim())
      return { isValid: false, error: "종목코드를 입력해주세요." };

    if (!request.marketDivCode)
      return { isValid: false, error: "시장코드를 선택해주세요." };

    if (!request.startDate)
      return { isValid: false, error: "시작일을 입력해주세요." };

    if (!request.endDate)
      return { isValid: false, error: "종료일을 입력해주세요." };

    const startDate = new Date(this.parseDate(request.startDate));
    const endDate = new Date(this.parseDate(request.endDate));

    if (startDate > endDate)
      return {
        isValid: false,
        error: "시작일은 종료일보다 이전이어야 합니다.",
      };

    if (endDate > new Date())
      return {
        isValid: false,
        error: "종료일은 현재 날짜보다 이후일 수 없습니다.",
      };

    return { isValid: true };
  }

  /**
   * 날짜를 API 형식으로 변환 (YYYYMMDD)
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  /**
   * API 형식 날짜를 Date 형식으로 변환
   */
  private static parseDate(dateString: string): string {
    if (dateString.length !== 8) return dateString;

    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
}

export class OverseasDateFormatter {
  static forInput(dateStr: string): string {
    if (!dateStr || dateStr.length !== 8) return "";
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  static fromInput(dateStr: string): string {
    return dateStr.replace(/-/g, "");
  }
}
