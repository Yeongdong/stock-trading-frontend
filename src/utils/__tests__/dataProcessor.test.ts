import { DataProcessor, ProcessedChartData } from "../dataProcessor";
import { PeriodPriceData } from "@/types/domains/stock/price";
import { Time } from "lightweight-charts";

const createPeriodData = (
  overrides: Partial<PeriodPriceData> = {}
): PeriodPriceData => ({
  date: "20240101",
  openPrice: 71000,
  highPrice: 72500,
  lowPrice: 70500,
  closePrice: 72000,
  volume: 15000000,
  tradingValue: 1080000000000,
  priceChange: 1000,
  changeSign: "2",
  flagCode: "00",
  splitRate: 1.0,
  ...overrides,
});

// 유효한 날짜 생성 함수
const generateValidDate = (index: number): string => {
  const baseDate = new Date(2024, 0, 1); // 2024년 1월 1일
  baseDate.setDate(baseDate.getDate() + index);

  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};

describe("DataProcessor", () => {
  describe("formatChartData", () => {
    it("유효한 데이터를 올바르게 변환한다", () => {
      const data = [createPeriodData()];
      const result = DataProcessor.formatChartData(data);

      expect(result.chartData).toHaveLength(1);
      expect(result.chartData[0]).toEqual({
        time: "2024-01-01" as Time,
        open: 71000,
        high: 72500,
        low: 70500,
        close: 72000,
      });
    });

    it("상승/하락에 따른 볼륨 색상을 설정한다", () => {
      const data = [
        createPeriodData({ closePrice: 72000 }), // 상승
        createPeriodData({ openPrice: 72000, closePrice: 71000 }), // 하락
      ];

      const result = DataProcessor.formatChartData(data);

      expect(result.volumeData[0].color).toBe("#ef444480"); // 상승
      expect(result.volumeData[1].color).toBe("#3b82f680"); // 하락
    });

    it("무효한 데이터를 필터링한다", () => {
      const invalidData = [
        createPeriodData({ date: "invalid" }), // 잘못된 날짜
        createPeriodData({ openPrice: 0 }), // 0 가격
        createPeriodData({ highPrice: 70000, openPrice: 72000 }), // high < open
        createPeriodData({ volume: -1 }), // 음수 볼륨
        createPeriodData({ date: "20240105" }), // 유효한 데이터
      ];

      const result = DataProcessor.formatChartData(invalidData);

      expect(result.chartData).toHaveLength(1);
      expect(result.chartData[0].time).toBe("2024-01-05");
    });

    it("데이터를 시간순으로 정렬한다", () => {
      const unsortedData = [
        createPeriodData({ date: "20240103" }),
        createPeriodData({ date: "20240101" }),
        createPeriodData({ date: "20240102" }),
      ];

      const result = DataProcessor.formatChartData(unsortedData);

      expect(result.chartData.map((d) => d.time)).toEqual([
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
      ]);
    });

    it("빈 배열에 대해 빈 결과를 반환한다", () => {
      const result = DataProcessor.formatChartData([]);
      expect(result).toEqual({ chartData: [], volumeData: [] });
    });
  });

  describe("getDataSummary", () => {
    const chartData = [
      {
        time: "2024-01-01" as Time,
        open: 71000,
        high: 72500,
        low: 70500,
        close: 72000,
      },
      {
        time: "2024-01-03" as Time,
        open: 72000,
        high: 74000,
        low: 71500,
        close: 73500,
      },
      {
        time: "2024-01-02" as Time,
        open: 72000,
        high: 73000,
        low: 71000,
        close: 72800,
      },
    ];

    it("데이터 요약을 올바르게 계산한다", () => {
      const summary = DataProcessor.getDataSummary(chartData);

      expect(summary).toEqual({
        totalItems: 3,
        dateRange: { start: "2024-01-01", end: "2024-01-03" },
        priceRange: { min: 70500, max: 74000 },
      });
    });

    it("빈 데이터에 대해 기본값을 반환한다", () => {
      const summary = DataProcessor.getDataSummary([]);

      expect(summary).toEqual({
        totalItems: 0,
        dateRange: { start: null, end: null },
        priceRange: { min: 0, max: 0 },
      });
    });
  });

  describe("validateProcessedData", () => {
    const createValidProcessedData = (): ProcessedChartData => ({
      chartData: [
        {
          time: "2024-01-01" as Time,
          open: 71000,
          high: 72500,
          low: 70500,
          close: 72000,
        },
      ],
      volumeData: [
        { time: "2024-01-01" as Time, value: 15000000, color: "#ef444480" },
      ],
    });

    it("유효한 데이터를 통과시킨다", () => {
      const result = DataProcessor.validateProcessedData(
        createValidProcessedData()
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it.each([
      [
        "데이터 개수 불일치",
        {
          chartData: [
            { time: "2024-01-01" as Time, open: 1, high: 2, low: 1, close: 2 },
          ],
          volumeData: [],
        },
        "차트 데이터와 볼륨 데이터의 개수가 일치하지 않습니다.",
      ],
      [
        "빈 데이터",
        { chartData: [], volumeData: [] },
        "처리된 데이터가 없습니다.",
      ],
      [
        "시간 불일치",
        {
          chartData: [
            { time: "2024-01-01" as Time, open: 1, high: 2, low: 1, close: 2 },
          ],
          volumeData: [
            { time: "2024-01-02" as Time, value: 1000, color: "#fff" },
          ],
        },
        "인덱스 0에서 시간이 일치하지 않습니다.",
      ],
    ])("%s을 감지한다", (_, data, expectedError) => {
      const result = DataProcessor.validateProcessedData(
        data as ProcessedChartData
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expectedError);
    });
  });

  describe("실제 사용 시나리오", () => {
    it("삼성전자 데이터를 처리한다", () => {
      const samsungData = [
        createPeriodData({ date: "20240102", closePrice: 72000 }), // 상승
        createPeriodData({
          date: "20240103",
          openPrice: 72000,
          closePrice: 71900,
        }), // 하락
      ];

      const result = DataProcessor.formatChartData(samsungData);
      const summary = DataProcessor.getDataSummary(result.chartData);

      expect(result.chartData).toHaveLength(2);
      expect(result.volumeData[0].color).toBe("#ef444480"); // 상승
      expect(result.volumeData[1].color).toBe("#3b82f680"); // 하락
      expect(summary.totalItems).toBe(2);
    });

    it("대용량 데이터를 빠르게 처리한다", () => {
      // 올바른 날짜 형식으로 1000개 데이터 생성
      const largeDataset = Array.from({ length: 1000 }, (_, i) =>
        createPeriodData({
          date: generateValidDate(i), // 순차적으로 유효한 날짜 생성
        })
      );

      const startTime = performance.now();
      const result = DataProcessor.formatChartData(largeDataset);
      const endTime = performance.now();

      expect(result.chartData).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
