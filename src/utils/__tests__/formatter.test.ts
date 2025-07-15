import {
  formatCurrency,
  formatKRW,
  formatNumber,
  formatPercent,
  formatExchangeRate,
  formatExchangeName,
} from "../formatters";

describe("formatters utils", () => {
  describe("formatNumber", () => {
    it("숫자를 천단위 콤마로 포맷팅해야 한다", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(0)).toBe("0");
      expect(formatNumber(123)).toBe("123");
    });

    it("문자열 숫자를 올바르게 처리해야 한다", () => {
      expect(formatNumber("1000")).toBe("1,000");
      expect(formatNumber("1234567.89")).toBe("1,234,567.89");
      expect(formatNumber("")).toBe("0");
      expect(formatNumber("abc")).toBe("0");
    });

    it("음수를 올바르게 포맷팅해야 한다", () => {
      expect(formatNumber(-1000)).toBe("-1,000");
      expect(formatNumber(-1234567)).toBe("-1,234,567");
    });

    it("소수점을 포함한 숫자를 처리해야 한다", () => {
      expect(formatNumber(1234.56)).toBe("1,234.56");
      expect(formatNumber(999.4)).toBe("999.4");
      expect(formatNumber(999.6)).toBe("999.6");
    });
  });

  describe("formatKRW", () => {
    it("원화 기호와 함께 포맷팅해야 한다", () => {
      expect(formatKRW(1000)).toBe("₩1,000");
      expect(formatKRW(1000000)).toBe("₩1,000,000");
      expect(formatKRW(0)).toBe("₩0");
    });

    it("문자열 입력을 올바르게 처리해야 한다", () => {
      expect(formatKRW("1000")).toBe("₩1,000");
      expect(formatKRW("")).toBe("₩0");
      expect(formatKRW("invalid")).toBe("₩0");
    });

    it("실제 주식 가격을 올바르게 포맷팅해야 한다", () => {
      // 삼성전자 주가 예시
      expect(formatKRW(71000)).toBe("₩71,000");
      // SK하이닉스 주가 예시
      expect(formatKRW(128500)).toBe("₩128,500");
      // 고가 주식 예시
      expect(formatKRW(500000)).toBe("₩500,000");
    });
  });

  describe("formatPercent", () => {
    it("양수에 + 기호를 추가해야 한다", () => {
      expect(formatPercent(1.5)).toBe("+1.5%");
      expect(formatPercent(10.0)).toBe("+10.0%");
      expect(formatPercent(0.1)).toBe("+0.1%");
    });

    it("음수에는 - 기호만 표시해야 한다", () => {
      expect(formatPercent(-1.5)).toBe("-1.5%");
      expect(formatPercent(-10.0)).toBe("-10.0%");
      expect(formatPercent(-0.1)).toBe("-0.1%");
    });

    it("0을 올바르게 처리해야 한다", () => {
      expect(formatPercent(0)).toBe("0.0%");
      expect(formatPercent(-0)).toBe("0.0%");
    });

    it("소수점 자릿수를 지정할 수 있어야 한다", () => {
      expect(formatPercent(1.234, 2)).toBe("+1.23%");
      expect(formatPercent(1.234, 0)).toBe("+1%");
      expect(formatPercent(-1.789, 3)).toBe("-1.789%");
    });

    it("실제 주식 등락률을 올바르게 포맷팅해야 한다", () => {
      expect(formatPercent(2.5)).toBe("+2.5%"); // 상승
      expect(formatPercent(-1.8)).toBe("-1.8%"); // 하락
      expect(formatPercent(0)).toBe("0.0%"); // 보합
      expect(formatPercent(15.75)).toBe("+15.8%"); // 상한가 근처
      expect(formatPercent(-15.25)).toBe("-15.3%"); // 하한가 근처
    });
  });

  describe("formatCurrency", () => {
    it("다양한 통화를 올바르게 포맷팅해야 한다", () => {
      expect(formatCurrency(1000, "USD")).toBe("$1,000.00");
      expect(formatCurrency(1000, "JPY")).toBe("¥1,000");
      expect(formatCurrency(1000, "EUR")).toBe("€1,000.00");
      expect(formatCurrency(1000, "GBP")).toBe("£1,000.00");
      expect(formatCurrency(1000, "HKD")).toBe("HK$1,000.00");
    });

    it("KRW와 JPY는 소수점 없이 포맷팅해야 한다", () => {
      expect(formatCurrency(1234.56, "KRW")).toBe("₩1,235");
      expect(formatCurrency(1234.56, "JPY")).toBe("¥1,235");
    });

    it("기타 통화는 소수점 2자리로 포맷팅해야 한다", () => {
      expect(formatCurrency(1234.567, "USD")).toBe("$1,234.57");
      expect(formatCurrency(1234.1, "EUR")).toBe("€1,234.10");
    });

    it("기본값으로 KRW를 사용해야 한다", () => {
      expect(formatCurrency(1000)).toBe("₩1,000");
    });

    it("알 수 없는 통화 코드를 그대로 사용해야 한다", () => {
      expect(formatCurrency(1000, "XYZ")).toBe("XYZ1,000.00");
    });

    it("문자열 입력을 올바르게 처리해야 한다", () => {
      expect(formatCurrency("1000.50", "USD")).toBe("$1,000.50");
      expect(formatCurrency("", "USD")).toBe("$0.00");
      expect(formatCurrency("invalid", "USD")).toBe("$0.00");
    });
  });

  describe("formatExchangeRate", () => {
    it("환율을 올바른 형식으로 포맷팅해야 한다", () => {
      expect(formatExchangeRate(1350, "USD")).toBe("1 USD = 1,350 KRW");
      expect(formatExchangeRate(900, "JPY", "KRW")).toBe("1 JPY = 900 KRW");
      expect(formatExchangeRate(1.2, "USD", "EUR")).toBe("1 USD = 1.2 EUR");
    });

    it("문자열 환율을 처리해야 한다", () => {
      expect(formatExchangeRate("1350.75", "USD")).toBe("1 USD = 1,350.75 KRW");
      expect(formatExchangeRate("", "USD")).toBe("1 USD = 0 KRW");
    });

    it("실제 환율 예시를 올바르게 포맷팅해야 한다", () => {
      // 미국 달러
      expect(formatExchangeRate(1320.5, "USD")).toBe("1 USD = 1,320.5 KRW");
      // 일본 엔 (100엔 기준이라면)
      expect(formatExchangeRate(885.25, "JPY")).toBe("1 JPY = 885.25 KRW");
      // 유로
      expect(formatExchangeRate(1450.8, "EUR")).toBe("1 EUR = 1,450.8 KRW");
    });
  });

  describe("formatExchangeName", () => {
    it("거래소 코드를 한국어 이름으로 변환해야 한다", () => {
      expect(formatExchangeName("NASD")).toBe("나스닥");
      expect(formatExchangeName("NYSE")).toBe("뉴욕증권거래소");
      expect(formatExchangeName("AMEX")).toBe("아멕스");
      expect(formatExchangeName("TKSE")).toBe("도쿄증권거래소");
      expect(formatExchangeName("LNSE")).toBe("런던증권거래소");
      expect(formatExchangeName("HKEX")).toBe("홍콩증권거래소");
    });

    it("알 수 없는 거래소 코드를 그대로 반환해야 한다", () => {
      expect(formatExchangeName("UNKNOWN")).toBe("UNKNOWN");
      expect(formatExchangeName("XYZ")).toBe("XYZ");
      expect(formatExchangeName("")).toBe("");
    });

    it("대소문자를 구분해야 한다", () => {
      expect(formatExchangeName("nasd")).toBe("nasd"); // 소문자는 변환 안됨
      expect(formatExchangeName("NASD")).toBe("나스닥"); // 대문자만 변환됨
    });
  });

  describe("금융 도메인 특수 케이스", () => {
    it("매우 큰 금액을 올바르게 처리해야 한다", () => {
      const largeCap = 1000000000000; // 1조원
      expect(formatKRW(largeCap)).toBe("₩1,000,000,000,000");
    });

    it("소액 주식 가격을 올바르게 처리해야 한다", () => {
      expect(formatKRW(500)).toBe("₩500"); // 저가주
      expect(formatKRW(1)).toBe("₩1"); // 최저가
    });

    it("해외 주식 가격을 올바르게 처리해야 한다", () => {
      expect(formatCurrency(150.75, "USD")).toBe("$150.75"); // 애플 주가
      expect(formatCurrency(0.01, "USD")).toBe("$0.01"); // 페니스톡
      expect(formatCurrency(1000000, "USD")).toBe("$1,000,000.00"); // 고가주
    });

    it("극단적인 등락률을 올바르게 처리해야 한다", () => {
      expect(formatPercent(30.0)).toBe("+30.0%"); // 상한가
      expect(formatPercent(-30.0)).toBe("-30.0%"); // 하한가
      expect(formatPercent(0.01)).toBe("+0.0%"); // 미세한 상승
      expect(formatPercent(-0.01)).toBe("-0.0%"); // 미세한 하락
    });
  });
});
