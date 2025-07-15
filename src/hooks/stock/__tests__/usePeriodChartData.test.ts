import { renderHook } from "@testing-library/react";
import { usePeriodChartData } from "../usePeriodChartData";
import {
  PeriodPriceResponse,
  PeriodPriceData,
} from "@/types/domains/stock/price";
import { DataProcessor, ProcessedChartData } from "@/utils/dataProcessor";
import { SummaryData } from "@/components/features/stock/chart/PeriodPriceChartModel";

jest.mock("@/utils/dataProcessor");
jest.mock("@/components/features/stock/chart/PeriodPriceChartModel");

const mockDataProcessor = DataProcessor as jest.Mocked<typeof DataProcessor>;
const MockSummaryData = SummaryData as jest.MockedClass<typeof SummaryData>;

const mockPriceData: PeriodPriceData = {
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
};

const mockPeriodResponse: PeriodPriceResponse = {
  stockCode: "005930",
  stockName: "삼성전자",
  currentPrice: 72000,
  priceChange: 1000,
  changeRate: 1.41,
  changeSign: "2",
  totalVolume: 15000000,
  totalTradingValue: 1080000000000,
  priceData: [mockPriceData],
};

const mockProcessedData: ProcessedChartData = {
  chartData: [
    {
      time: "2024-01-01" as const,
      open: 71000,
      high: 72500,
      low: 70500,
      close: 72000,
    },
  ],
  volumeData: [
    {
      time: "2024-01-01" as const,
      value: 15000000,
      color: "#ef444480",
    },
  ],
};

const mockSummaryData = {
  items: [
    { label: "현재가", value: "72,000원", className: "price-up" },
    { label: "등락률", value: "+1.41%", className: "change-up" },
  ],
};

const mockEmptyProcessedData: ProcessedChartData = {
  chartData: [],
  volumeData: [],
};

describe("usePeriodChartData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("초기 상태", () => {
    it("null 데이터로 초기화되어야 한다", () => {
      const { result } = renderHook(() => usePeriodChartData(null));

      expect(result.current.processedData).toBeNull();
      expect(result.current.summaryData).toBeNull();
      expect(result.current.hasValidData).toBe(false);
    });
  });

  describe("데이터 처리", () => {
    it("유효한 데이터를 올바르게 처리해야 한다", () => {
      mockDataProcessor.formatChartData.mockReturnValue(mockProcessedData);
      MockSummaryData.mockImplementation(() => mockSummaryData as SummaryData);

      const { result } = renderHook(() =>
        usePeriodChartData(mockPeriodResponse)
      );

      expect(mockDataProcessor.formatChartData).toHaveBeenCalledWith([
        mockPriceData,
      ]);
      expect(MockSummaryData).toHaveBeenCalledWith(mockPeriodResponse);

      expect(result.current.processedData).toEqual(mockProcessedData);
      expect(result.current.summaryData).toEqual(mockSummaryData);
      expect(result.current.hasValidData).toBe(true);
    });

    it("빈 priceData 배열을 처리해야 한다", () => {
      const emptyDataResponse: PeriodPriceResponse = {
        ...mockPeriodResponse,
        priceData: [],
      };

      mockDataProcessor.formatChartData.mockReturnValue(mockEmptyProcessedData);
      MockSummaryData.mockImplementation(() => mockSummaryData as SummaryData);

      const { result } = renderHook(() =>
        usePeriodChartData(emptyDataResponse)
      );

      expect(result.current.processedData).toEqual(mockEmptyProcessedData);
      expect(result.current.summaryData).toEqual(mockSummaryData);
      expect(result.current.hasValidData).toBe(false); // 빈 차트 데이터이므로 false
    });

    it("priceData가 없는 경우를 처리해야 한다", () => {
      const noDataResponse: PeriodPriceResponse = {
        ...mockPeriodResponse,
        priceData: undefined as unknown as PeriodPriceData[],
      };

      const { result } = renderHook(() => usePeriodChartData(noDataResponse));

      expect(result.current.processedData).toBeNull();
      expect(result.current.hasValidData).toBe(false);
    });
  });

  describe("useMemo 의존성 배열", () => {
    it("priceData 변경 시에만 차트 데이터를 재처리해야 한다", () => {
      mockDataProcessor.formatChartData.mockReturnValue(mockProcessedData);
      MockSummaryData.mockImplementation(() => mockSummaryData as SummaryData);

      const { rerender } = renderHook(({ data }) => usePeriodChartData(data), {
        initialProps: { data: mockPeriodResponse },
      });

      expect(mockDataProcessor.formatChartData).toHaveBeenCalledTimes(1);

      // 같은 priceData로 재렌더링
      rerender({ data: { ...mockPeriodResponse } });

      // formatChartData는 호출되지 않아야 함 (useMemo 캐싱)
      expect(mockDataProcessor.formatChartData).toHaveBeenCalledTimes(1);

      // priceData 변경
      const newResponse = {
        ...mockPeriodResponse,
        priceData: [{ ...mockPriceData, closePrice: 73000 }],
      };

      rerender({ data: newResponse });

      // formatChartData가 다시 호출되어야 함
      expect(mockDataProcessor.formatChartData).toHaveBeenCalledTimes(2);
    });

    it("전체 데이터 변경 시에만 요약 데이터를 재생성해야 한다", () => {
      MockSummaryData.mockImplementation(() => mockSummaryData as SummaryData);

      const { rerender } = renderHook(({ data }) => usePeriodChartData(data), {
        initialProps: { data: mockPeriodResponse },
      });

      expect(MockSummaryData).toHaveBeenCalledTimes(1);

      // 같은 데이터로 재렌더링
      rerender({ data: { ...mockPeriodResponse } });

      // SummaryData는 재생성되지 않아야 함
      expect(MockSummaryData).toHaveBeenCalledTimes(1);

      // 데이터 변경
      const newResponse = {
        ...mockPeriodResponse,
        currentPrice: 73000,
      };

      rerender({ data: newResponse });

      // SummaryData가 다시 생성되어야 함
      expect(MockSummaryData).toHaveBeenCalledTimes(2);
    });
  });

  describe("hasValidData 계산", () => {
    it("processedData와 summaryData가 모두 있을 때 true를 반환해야 한다", () => {
      mockDataProcessor.formatChartData.mockReturnValue(mockProcessedData);
      MockSummaryData.mockImplementation(() => mockSummaryData as SummaryData);

      const { result } = renderHook(() =>
        usePeriodChartData(mockPeriodResponse)
      );

      expect(result.current.hasValidData).toBe(true);
    });

    it("processedData가 빈 배열일 때 false를 반환해야 한다", () => {
      mockDataProcessor.formatChartData.mockReturnValue(mockEmptyProcessedData);
      MockSummaryData.mockImplementation(() => mockSummaryData as SummaryData);

      const emptyDataResponse: PeriodPriceResponse = {
        ...mockPeriodResponse,
        priceData: [],
      };

      const { result } = renderHook(() =>
        usePeriodChartData(emptyDataResponse)
      );

      expect(result.current.hasValidData).toBe(false);
    });

    it("summaryData가 null일 때 false를 반환해야 한다", () => {
      mockDataProcessor.formatChartData.mockReturnValue(mockProcessedData);
      MockSummaryData.mockImplementation(() => null as unknown as SummaryData);

      const { result } = renderHook(() =>
        usePeriodChartData(mockPeriodResponse)
      );

      expect(result.current.hasValidData).toBe(false);
    });

    it("둘 다 null일 때 false를 반환해야 한다", () => {
      const { result } = renderHook(() => usePeriodChartData(null));

      expect(result.current.hasValidData).toBe(false);
    });
  });

  describe("실제 사용 시나리오", () => {
    it("삼성전자 차트 데이터를 처리해야 한다", () => {
      const samsungResponse: PeriodPriceResponse = {
        stockCode: "005930",
        stockName: "삼성전자",
        currentPrice: 72000,
        priceChange: 1000,
        changeRate: 1.41,
        changeSign: "2",
        totalVolume: 15000000,
        totalTradingValue: 1080000000000,
        priceData: [
          mockPriceData,
          { ...mockPriceData, date: "20240102", closePrice: 73000 },
        ],
      };

      mockDataProcessor.formatChartData.mockReturnValue(mockProcessedData);
      MockSummaryData.mockImplementation(() => mockSummaryData as SummaryData);

      const { result } = renderHook(() => usePeriodChartData(samsungResponse));

      expect(mockDataProcessor.formatChartData).toHaveBeenCalledWith(
        samsungResponse.priceData
      );
      expect(MockSummaryData).toHaveBeenCalledWith(samsungResponse);
      expect(result.current.hasValidData).toBe(true);
    });

    it("API 에러로 인한 빈 데이터를 처리해야 한다", () => {
      const errorResponse: PeriodPriceResponse = {
        stockCode: "999999",
        stockName: "존재하지않는종목",
        currentPrice: 0,
        priceChange: 0,
        changeRate: 0,
        changeSign: "3",
        totalVolume: 0,
        totalTradingValue: 0,
        priceData: [],
      };

      mockDataProcessor.formatChartData.mockReturnValue(mockEmptyProcessedData);
      MockSummaryData.mockImplementation(() => mockSummaryData as SummaryData);

      const { result } = renderHook(() => usePeriodChartData(errorResponse));

      expect(result.current.processedData).toEqual(mockEmptyProcessedData);
      expect(result.current.summaryData).toEqual(mockSummaryData);
      expect(result.current.hasValidData).toBe(false);
    });
  });
});
