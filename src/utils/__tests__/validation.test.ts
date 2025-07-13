import {
  isValidStockCode,
  isNumericString,
  isPositiveNumber,
} from "../validation";

describe("validation utils", () => {
  describe("isValidStockCode", () => {
    it("유효한 6자리 주식 코드를 승인해야 한다", () => {
      // 삼성전자
      expect(isValidStockCode("005930")).toBe(true);
      // SK하이닉스
      expect(isValidStockCode("000660")).toBe(true);
      // NAVER
      expect(isValidStockCode("035420")).toBe(true);
      // 카카오
      expect(isValidStockCode("035720")).toBe(true);
    });

    it("무효한 주식 코드를 거부해야 한다", () => {
      // 5자리
      expect(isValidStockCode("12345")).toBe(false);
      // 7자리
      expect(isValidStockCode("1234567")).toBe(false);
      // 빈 문자열
      expect(isValidStockCode("")).toBe(false);
      // 알파벳 포함
      expect(isValidStockCode("123ABC")).toBe(false);
      // 특수문자 포함
      expect(isValidStockCode("123-45")).toBe(false);
      // 공백 포함
      expect(isValidStockCode("123 45")).toBe(false);
    });

    it("선행 0이 있는 코드를 올바르게 처리해야 한다", () => {
      expect(isValidStockCode("000001")).toBe(true);
      expect(isValidStockCode("001234")).toBe(true);
      expect(isValidStockCode("000000")).toBe(true);
    });
  });

  describe("isNumericString", () => {
    it("유효한 숫자 문자열을 승인해야 한다", () => {
      expect(isNumericString("123")).toBe(true);
      expect(isNumericString("0")).toBe(true);
      expect(isNumericString("1.5")).toBe(true);
      expect(isNumericString("0.001")).toBe(true);
      expect(isNumericString("-5")).toBe(true);
      expect(isNumericString("-1.5")).toBe(true);
    });

    it("무효한 숫자 문자열을 거부해야 한다", () => {
      expect(isNumericString("")).toBe(false);
      expect(isNumericString("abc")).toBe(false);
      expect(isNumericString("12abc")).toBe(false);
      expect(isNumericString("12.34.56")).toBe(false);
      expect(isNumericString("--5")).toBe(false);
      expect(isNumericString("NaN")).toBe(false);
      expect(isNumericString("Infinity")).toBe(false);
    });

    it("공백을 포함한 문자열을 거부해야 한다", () => {
      expect(isNumericString(" ")).toBe(false);
      expect(isNumericString(" 123 ")).toBe(false);
      expect(isNumericString("1 23")).toBe(false);
    });

    it("특수한 숫자 케이스를 올바르게 처리해야 한다", () => {
      expect(isNumericString("0.0")).toBe(true);
      expect(isNumericString(".5")).toBe(true);
      expect(isNumericString("5.")).toBe(true);
    });
  });

  describe("isPositiveNumber", () => {
    describe("문자열 입력", () => {
      it("유효한 양수 문자열을 승인해야 한다", () => {
        expect(isPositiveNumber("1")).toBe(true);
        expect(isPositiveNumber("123")).toBe(true);
        expect(isPositiveNumber("0.1")).toBe(true);
        expect(isPositiveNumber("1.5")).toBe(true);
        expect(isPositiveNumber("999.99")).toBe(true);
        expect(isPositiveNumber("0.001")).toBe(true);
      });

      it("0과 음수 문자열을 거부해야 한다", () => {
        expect(isPositiveNumber("0")).toBe(false);
        expect(isPositiveNumber("-1")).toBe(false);
        expect(isPositiveNumber("-0.1")).toBe(false);
        expect(isPositiveNumber("-999")).toBe(false);
      });

      it("무효한 문자열을 거부해야 한다", () => {
        expect(isPositiveNumber("")).toBe(false);
        expect(isPositiveNumber("abc")).toBe(false);
        expect(isPositiveNumber("12abc")).toBe(false);
        expect(isPositiveNumber("NaN")).toBe(false);
        expect(isPositiveNumber("Infinity")).toBe(false);
      });
    });

    describe("숫자 입력", () => {
      it("유효한 양수를 승인해야 한다", () => {
        expect(isPositiveNumber(1)).toBe(true);
        expect(isPositiveNumber(123)).toBe(true);
        expect(isPositiveNumber(0.1)).toBe(true);
        expect(isPositiveNumber(1.5)).toBe(true);
        expect(isPositiveNumber(999.99)).toBe(true);
        expect(isPositiveNumber(Number.MAX_VALUE)).toBe(true);
      });

      it("0과 음수를 거부해야 한다", () => {
        expect(isPositiveNumber(0)).toBe(false);
        expect(isPositiveNumber(-1)).toBe(false);
        expect(isPositiveNumber(-0.1)).toBe(false);
        expect(isPositiveNumber(-999)).toBe(false);
        expect(isPositiveNumber(Number.MIN_VALUE)).toBe(true); // MIN_VALUE는 양수
        expect(isPositiveNumber(-Number.MAX_VALUE)).toBe(false);
      });

      it("특수한 숫자 값들을 거부해야 한다", () => {
        expect(isPositiveNumber(NaN)).toBe(false);
        expect(isPositiveNumber(Infinity)).toBe(false);
        expect(isPositiveNumber(-Infinity)).toBe(false);
      });
    });

    describe("금융 도메인 특수 케이스", () => {
      it("주식 가격 범위의 값들을 올바르게 처리해야 한다", () => {
        // 원화 주식 (일반적으로 100원 이상)
        expect(isPositiveNumber(100)).toBe(true);
        expect(isPositiveNumber(50000)).toBe(true);
        expect(isPositiveNumber(1000000)).toBe(true);

        // 달러 주식 (소수점 포함)
        expect(isPositiveNumber(1.25)).toBe(true);
        expect(isPositiveNumber(0.01)).toBe(true);
        expect(isPositiveNumber(999.99)).toBe(true);
      });

      it("주문 수량 범위의 값들을 올바르게 처리해야 한다", () => {
        expect(isPositiveNumber(1)).toBe(true); // 최소 주문 수량
        expect(isPositiveNumber(10)).toBe(true);
        expect(isPositiveNumber(100)).toBe(true);
        expect(isPositiveNumber(1000000)).toBe(true); // 대량 주문
      });
    });
  });
});
