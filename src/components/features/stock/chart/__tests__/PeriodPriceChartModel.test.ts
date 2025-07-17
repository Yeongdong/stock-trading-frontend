import {
  DateFormatter,
  ChartDataProcessor,
  PriceFormatter,
  ChangeIndicator,
  SummaryData,
  ChartConfig,
} from "../PeriodPriceChartModel";
import {
  PeriodPriceData,
  PeriodPriceResponse,
} from "@/types/domains/stock/price";
import { ChartData } from "@/types";

describe("PeriodPriceChartModel", () => {
  describe("DateFormatter", () => {
    it("유효한 날짜를 올바르게 파싱한다", () => {
      const result = DateFormatter.parseYYYYMMDD("20240315");
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(15);
    });

    it("잘못된 형식에 대해 에러를 던진다", () => {
      const invalidInputs = ["", "2024031", "202403155", "abc"];

      invalidInputs.forEach((input) => {
        expect(() => DateFormatter.parseYYYYMMDD(input)).toThrow();
      });
    });

    it("존재하지 않는 날짜에 대해 에러를 던진다", () => {
      expect(() => DateFormatter.parseYYYYMMDD("20240230")).toThrow(
        "Date validation failed"
      );
      expect(() => DateFormatter.parseYYYYMMDD("20240431")).toThrow(
        "Date validation failed"
      );
    });

    it("Date를 YYYYMMDD 형식으로 변환한다", () => {
      expect(DateFormatter.toYYYYMMDD(new Date(2024, 2, 15))).toBe("20240315");
      expect(DateFormatter.toYYYYMMDD(new Date(2024, 0, 5))).toBe("20240105");
    });

    it("입력 형식을 변환한다", () => {
      expect(DateFormatter.forInput("20240315")).toBe("2024-03-15");
      expect(DateFormatter.forInput("2024031")).toBe(""); // 잘못된 형식
      expect(DateFormatter.fromInput("2024-03-15")).toBe("20240315");
    });

    it("기본 날짜 범위를 생성한다", () => {
      const mockNow = new Date(2024, 5, 15);
      jest.useFakeTimers();
      jest.setSystemTime(mockNow);

      expect(DateFormatter.getDefaultStartDate()).toBe("20240315");
      expect(DateFormatter.getDefaultEndDate()).toBe("20240615");

      jest.useRealTimers();
    });
  });

  describe("ChartDataProcessor", () => {
    const createMockPriceData = (
      date: string,
      prices: number[]
    ): PeriodPriceData => ({
      date,
      openPrice: prices[0],
      highPrice: prices[1],
      lowPrice: prices[2],
      closePrice: prices[3],
      volume: 1000000,
      tradingValue: 70000000000,
      priceChange: 1000,
      changeSign: "2",
      flagCode: "",
      splitRate: 1,
    });

    const mockData: PeriodPriceData[] = [
      createMockPriceData("20240315", [70000, 72000, 69000, 71000]),
      createMockPriceData("20240314", [69000, 70500, 68500, 70000]),
    ];

    it("데이터를 변환하고 날짜순으로 정렬한다", () => {
      const result = ChartDataProcessor.transformToChartData(mockData);

      expect(result).toHaveLength(2);
      expect(result[0].open).toBe(69000); // 14일이 첫 번째
      expect(result[1].open).toBe(70000); // 15일이 두 번째
      expect(result[0].date.getTime()).toBeLessThan(result[1].date.getTime());
    });

    it("잘못된 날짜와 가격 데이터를 필터링한다", () => {
      const invalidData = [
        ...mockData,
        createMockPriceData("invalid", [70000, 72000, 69000, 71000]), // 잘못된 날짜
        createMockPriceData("20240230", [70000, 72000, 69000, 71000]), // 존재하지 않는 날짜
        createMockPriceData("20240316", [0, 72000, 69000, 71000]), // 잘못된 가격 (open = 0)
        createMockPriceData("20240317", [70000, 69000, 69000, 71000]), // 논리적 오류 (high < open)
      ];

      const result = ChartDataProcessor.transformToChartData(invalidData);

      // 유효한 데이터만 남아야 함 (원본 2개)
      expect(result).toHaveLength(2);
      expect(result[0].open).toBe(69000); // 14일
      expect(result[1].open).toBe(70000); // 15일
    });

    it("빈 배열을 처리한다", () => {
      const result = ChartDataProcessor.transformToChartData([]);
      expect(result).toEqual([]);
    });

    it("가격 데이터 유효성을 검증한다", () => {
      const priceTestCases = [
        {
          prices: [70000, 72000, 69000, 71000],
          valid: true,
          desc: "정상적인 가격",
        },
        { prices: [0, 72000, 69000, 71000], valid: false, desc: "시가 0" },
        {
          prices: [70000, 69000, 68000, 71000],
          valid: false,
          desc: "고가 < 시가",
        },
        {
          prices: [70000, 72000, 73000, 71000],
          valid: false,
          desc: "저가 > 시가",
        },
        {
          prices: [70000, 71000, 69000, 72000],
          valid: false,
          desc: "고가 < 종가",
        },
      ];

      priceTestCases.forEach(({ prices, valid }) => {
        const data = [createMockPriceData("20240315", prices)];
        const result = ChartDataProcessor.transformToChartData(data);

        if (valid) {
          expect(result).toHaveLength(1);
        } else {
          expect(result).toHaveLength(0);
        }
      });
    });

    it("X축 범위를 올바르게 계산한다", () => {
      const chartData: ChartData[] = [
        {
          date: new Date(2024, 0, 1),
          open: 100,
          high: 110,
          low: 95,
          close: 105,
          volume: 1000,
        },
        {
          date: new Date(2024, 0, 2),
          open: 105,
          high: 115,
          low: 100,
          close: 110,
          volume: 1200,
        },
        {
          date: new Date(2024, 0, 3),
          open: 110,
          high: 120,
          low: 105,
          close: 115,
          volume: 1500,
        },
      ];
      const xAccessor = (d: ChartData) => d.date.getTime();

      const fullRange = ChartDataProcessor.getXExtents(chartData, xAccessor);
      expect(fullRange[0]).toBe(chartData[0].date.getTime());
      expect(fullRange[1]).toBe(chartData[2].date.getTime());

      const limitedRange = ChartDataProcessor.getXExtents(
        chartData,
        xAccessor,
        2
      );
      expect(limitedRange[0]).toBe(chartData[1].date.getTime());
      expect(limitedRange[1]).toBe(chartData[2].date.getTime());

      const emptyRange = ChartDataProcessor.getXExtents([], xAccessor);
      expect(emptyRange).toEqual([0, 1]);
    });
  });

  describe("PriceFormatter", () => {
    it("가격을 한국어 형식으로 포맷한다", () => {
      expect(PriceFormatter.format(70000)).toBe("70,000");
      expect(PriceFormatter.format(1234567)).toBe("1,234,567");
      expect(PriceFormatter.format(0)).toBe("0");
    });

    it("거래량을 적절한 단위로 포맷한다", () => {
      expect(PriceFormatter.formatVolume(150000000)).toBe("1.5억");
      expect(PriceFormatter.formatVolume(100000000)).toBe("1.0억");
      expect(PriceFormatter.formatVolume(50000)).toBe("5.0만");
      expect(PriceFormatter.formatVolume(10000)).toBe("1.0만");
      expect(PriceFormatter.formatVolume(5000)).toBe("5,000");
      expect(PriceFormatter.formatVolume(0)).toBe("0");
    });
  });

  describe("ChangeIndicator", () => {
    it("등락 신호에 따른 색상을 반환한다", () => {
      expect(ChangeIndicator.getColor("2")).toBe("up");
      expect(ChangeIndicator.getColor("5")).toBe("down");
      expect(ChangeIndicator.getColor("3")).toBe("neutral");
      expect(ChangeIndicator.getColor("1")).toBe("neutral");
      expect(ChangeIndicator.getColor("")).toBe("neutral");
    });

    it("변동률을 올바르게 포맷한다", () => {
      expect(ChangeIndicator.formatChange(1000, 1.5)).toBe("+1,000원 (+1.50%)");
      expect(ChangeIndicator.formatChange(-1000, -1.5)).toBe(
        "-1,000원 (-1.50%)"
      );
      expect(ChangeIndicator.formatChange(0, 0)).toBe("0원 (0.00%)");
      expect(ChangeIndicator.formatChange(500, 0.75)).toBe("+500원 (+0.75%)");
    });
  });

  describe("SummaryData", () => {
    const createMockResponse = (
      overrides: Partial<PeriodPriceResponse> = {}
    ): PeriodPriceResponse => ({
      stockCode: "005930",
      stockName: "삼성전자",
      currentPrice: 71000,
      priceChange: 1000,
      changeRate: 1.43,
      changeSign: "2",
      totalVolume: 15000000,
      totalTradingValue: 1050000000000,
      priceData: [],
      ...overrides,
    });

    it("상승 종목의 요약 데이터를 생성한다", () => {
      const mockResponse = createMockResponse();
      const summaryData = new SummaryData(mockResponse);
      const items = summaryData.items;

      expect(items).toHaveLength(4);
      expect(items[0]).toEqual({
        label: "현재가",
        value: "71,000원",
        className: "value",
      });
      expect(items[1]).toEqual({
        label: "전일대비",
        value: "+1,000원 (+1.43%)",
        className: "value up",
      });
    });

    it("하락 종목의 요약 데이터를 생성한다", () => {
      const mockResponse = createMockResponse({
        priceChange: -1000,
        changeRate: -1.43,
        changeSign: "5",
      });

      const summaryData = new SummaryData(mockResponse);
      const items = summaryData.items;

      expect(items[1]).toEqual({
        label: "전일대비",
        value: "-1,000원 (-1.43%)",
        className: "value down",
      });
    });
  });

  describe("ChartConfig", () => {
    it("차트 설정 상수가 정의되어 있다", () => {
      expect(ChartConfig.CHART_HEIGHT).toBe(400);
      expect(ChartConfig.VOLUME_HEIGHT).toBe(150);
      expect(ChartConfig.CHART_WIDTH).toBe(800);
      expect(ChartConfig.MARGIN).toEqual({
        left: 50,
        right: 50,
        top: 10,
        bottom: 30,
      });
    });

    it("상승 캔들의 색상을 반환한다", () => {
      const upData: ChartData = {
        date: new Date(),
        open: 100,
        high: 110,
        low: 95,
        close: 105, // close > open
        volume: 1000,
      };

      const colors = ChartConfig.getCandlestickColors(upData);
      expect(colors.fill).toBe("#ef4444");
      expect(colors.stroke).toBe("#dc2626");
    });

    it("하락 캔들의 색상을 반환한다", () => {
      const downData: ChartData = {
        date: new Date(),
        open: 100,
        high: 105,
        low: 90,
        close: 95, // close < open
        volume: 1000,
      };

      const colors = ChartConfig.getCandlestickColors(downData);
      expect(colors.fill).toBe("#3b82f6");
      expect(colors.stroke).toBe("#2563eb");
    });

    it("동가 캔들의 색상을 반환한다", () => {
      const sameData: ChartData = {
        date: new Date(),
        open: 100,
        high: 105,
        low: 95,
        close: 100, // close === open
        volume: 1000,
      };

      const colors = ChartConfig.getCandlestickColors(sameData);
      expect(colors.fill).toBe("#3b82f6"); // close === open은 하락으로 처리
    });
  });
});
