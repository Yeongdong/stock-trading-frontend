import { renderHook, act } from "@testing-library/react";
import { useChartData } from "../useChartData";
import { RealtimeStockData } from "@/types/domains/realtime/entities";
import { LIMITS } from "@/constants";

// 테스트용 목 데이터
const createMockStockData = (
  symbol: string,
  price: number
): RealtimeStockData => ({
  symbol,
  name: `테스트${symbol}`,
  price,
  priceChange: 0,
  changeRate: 0,
  changeDirection: "unchanged",
  volume: 1000,
  openPrice: price,
  highPrice: price,
  lowPrice: price,
  previousClosePrice: price,
  timestamp: "2025-07-14T10:30:00",
  marketType: "regular",
});

describe("useChartData", () => {
  beforeEach(() => {
    // 시간 관련 함수 모킹
    jest
      .spyOn(Date.prototype, "toLocaleTimeString")
      .mockReturnValue("10:30:00");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("초기 상태에서 빈 차트 데이터를 반환한다", () => {
    const { result } = renderHook(() => useChartData());

    expect(result.current.chartData).toEqual({});
  });

  describe("차트 데이터 업데이트", () => {
    it("새로운 종목의 차트 데이터를 추가할 수 있다", () => {
      const { result } = renderHook(() => useChartData());
      const stockData = createMockStockData("005930", 75000);

      act(() => {
        result.current.updateChartData(stockData);
      });

      expect(result.current.chartData["005930"]).toHaveLength(1);
      expect(result.current.chartData["005930"][0]).toEqual({
        time: "10:30:00",
        price: 75000,
      });
    });

    it("기존 종목에 새로운 데이터 포인트를 추가할 수 있다", () => {
      const { result } = renderHook(() => useChartData());
      const stockData1 = createMockStockData("005930", 75000);
      const stockData2 = createMockStockData("005930", 76000);

      act(() => {
        result.current.updateChartData(stockData1);
      });

      act(() => {
        result.current.updateChartData(stockData2);
      });

      expect(result.current.chartData["005930"]).toHaveLength(2);
      expect(result.current.chartData["005930"][1].price).toBe(76000);
    });

    it("동일한 가격은 스킵한다", () => {
      const { result } = renderHook(() => useChartData());
      const stockData1 = createMockStockData("005930", 75000);
      const stockData2 = createMockStockData("005930", 75000); // 동일한 가격

      act(() => {
        result.current.updateChartData(stockData1);
      });

      act(() => {
        result.current.updateChartData(stockData2);
      });

      expect(result.current.chartData["005930"]).toHaveLength(1);
    });

    it("여러 종목의 데이터를 독립적으로 관리한다", () => {
      const { result } = renderHook(() => useChartData());
      const samsungData = createMockStockData("005930", 75000);
      const skData = createMockStockData("000660", 120000);

      act(() => {
        result.current.updateChartData(samsungData);
        result.current.updateChartData(skData);
      });

      expect(result.current.chartData["005930"]).toHaveLength(1);
      expect(result.current.chartData["000660"]).toHaveLength(1);
      expect(result.current.chartData["005930"][0].price).toBe(75000);
      expect(result.current.chartData["000660"][0].price).toBe(120000);
    });
  });

  describe("최대 길이 제한", () => {
    it("최대 길이를 초과하면 오래된 데이터를 제거한다", () => {
      const { result } = renderHook(() => useChartData());
      const symbol = "005930";

      // 최대 길이 + 1개의 데이터 추가
      act(() => {
        for (let i = 0; i <= LIMITS.MAX_CHART_DATA_POINTS; i++) {
          const stockData = createMockStockData(symbol, 75000 + i);
          result.current.updateChartData(stockData);
        }
      });

      expect(result.current.chartData[symbol]).toHaveLength(
        LIMITS.MAX_CHART_DATA_POINTS
      );

      // 첫 번째 데이터는 제거되고, 마지막 데이터는 유지되어야 함
      const chartData = result.current.chartData[symbol];
      expect(chartData[0].price).toBe(75001); // 첫 번째가 제거되어 두 번째가 첫 번째가 됨
      expect(chartData[chartData.length - 1].price).toBe(
        75000 + LIMITS.MAX_CHART_DATA_POINTS
      );
    });

    it("최대 길이 미만에서는 모든 데이터를 유지한다", () => {
      const { result } = renderHook(() => useChartData());
      const symbol = "005930";
      const dataCount = LIMITS.MAX_CHART_DATA_POINTS - 5;

      act(() => {
        for (let i = 0; i < dataCount; i++) {
          const stockData = createMockStockData(symbol, 75000 + i);
          result.current.updateChartData(stockData);
        }
      });

      expect(result.current.chartData[symbol]).toHaveLength(dataCount);
    });
  });

  describe("차트 데이터 조회", () => {
    it("존재하는 종목의 차트 데이터를 반환한다", () => {
      const { result } = renderHook(() => useChartData());
      const stockData = createMockStockData("005930", 75000);

      act(() => {
        result.current.updateChartData(stockData);
      });

      const chartData = result.current.getChartData("005930");
      expect(chartData).toHaveLength(1);
      expect(chartData[0].price).toBe(75000);
    });

    it("존재하지 않는 종목은 빈 배열을 반환한다", () => {
      const { result } = renderHook(() => useChartData());

      const chartData = result.current.getChartData("999999");
      expect(chartData).toEqual([]);
    });

    it("여러 종목 중 특정 종목만 조회한다", () => {
      const { result } = renderHook(() => useChartData());
      const samsungData = createMockStockData("005930", 75000);
      const skData = createMockStockData("000660", 120000);

      act(() => {
        result.current.updateChartData(samsungData);
        result.current.updateChartData(skData);
      });

      const samsungChart = result.current.getChartData("005930");
      const skChart = result.current.getChartData("000660");

      expect(samsungChart).toHaveLength(1);
      expect(skChart).toHaveLength(1);
      expect(samsungChart[0].price).toBe(75000);
      expect(skChart[0].price).toBe(120000);
    });
  });

  describe("차트 데이터 삭제", () => {
    it("특정 종목의 차트 데이터를 삭제할 수 있다", () => {
      const { result } = renderHook(() => useChartData());
      const stockData = createMockStockData("005930", 75000);

      act(() => {
        result.current.updateChartData(stockData);
      });

      expect(result.current.chartData["005930"]).toHaveLength(1);

      act(() => {
        result.current.removeChartData("005930");
      });

      expect(result.current.chartData["005930"]).toBeUndefined();
      expect(result.current.getChartData("005930")).toEqual([]);
    });

    it("여러 종목 중 특정 종목만 삭제한다", () => {
      const { result } = renderHook(() => useChartData());
      const samsungData = createMockStockData("005930", 75000);
      const skData = createMockStockData("000660", 120000);

      act(() => {
        result.current.updateChartData(samsungData);
        result.current.updateChartData(skData);
      });

      act(() => {
        result.current.removeChartData("005930");
      });

      expect(result.current.chartData["005930"]).toBeUndefined();
      expect(result.current.chartData["000660"]).toHaveLength(1);
    });

    it("존재하지 않는 종목 삭제 시도시 에러가 발생하지 않는다", () => {
      const { result } = renderHook(() => useChartData());

      expect(() => {
        act(() => {
          result.current.removeChartData("999999");
        });
      }).not.toThrow();
    });
  });

  describe("데이터 포인트 구조", () => {
    it("데이터 포인트가 올바른 구조를 가진다", () => {
      const { result } = renderHook(() => useChartData());
      const stockData = createMockStockData("005930", 75000);

      act(() => {
        result.current.updateChartData(stockData);
      });

      const dataPoint = result.current.chartData["005930"][0];
      expect(dataPoint).toHaveProperty("time");
      expect(dataPoint).toHaveProperty("price");
      expect(typeof dataPoint.time).toBe("string");
      expect(typeof dataPoint.price).toBe("number");
    });

    it("시간이 올바르게 포맷된다", () => {
      const { result } = renderHook(() => useChartData());
      const stockData = createMockStockData("005930", 75000);

      act(() => {
        result.current.updateChartData(stockData);
      });

      const dataPoint = result.current.chartData["005930"][0];
      expect(dataPoint.time).toBe("10:30:00");
    });
  });

  describe("메모리 효율성", () => {
    it("대량의 업데이트가 메모리 누수를 발생시키지 않는다", () => {
      const { result } = renderHook(() => useChartData());
      const symbol = "005930";

      // 많은 수의 업데이트 수행
      act(() => {
        for (let i = 0; i < 1000; i++) {
          const stockData = createMockStockData(symbol, 75000 + (i % 100)); // 가격 변동
          result.current.updateChartData(stockData);
        }
      });

      // 최대 길이를 초과하지 않는지 확인
      expect(result.current.chartData[symbol].length).toBeLessThanOrEqual(
        LIMITS.MAX_CHART_DATA_POINTS
      );
    });
  });
});
