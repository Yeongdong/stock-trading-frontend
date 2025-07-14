import React from "react";
import { render, screen, act } from "@testing-library/react";
import { StockDataProvider, useStockData } from "../StockDataContext";
import { ErrorProvider } from "../ErrorContext";
import { RealtimeStockData } from "@/types/domains/realtime/entities";

// 테스트용 목 데이터
const mockStockData: RealtimeStockData = {
  symbol: "005930",
  name: "삼성전자",
  price: 75000,
  priceChange: 1000,
  changeRate: 1.35,
  changeDirection: "up",
  volume: 12345678,
  openPrice: 74000,
  highPrice: 76000,
  lowPrice: 73500,
  previousClosePrice: 74000,
  timestamp: "2025-07-14T10:30:00",
  marketType: "regular",
};

// 테스트용 컴포넌트
const TestComponent: React.FC = () => {
  const { stockData, updateStockData, removeStockData, clearAllStockData } =
    useStockData();
  const stockCount = Object.keys(stockData).length;

  return (
    <div>
      <div data-testid="stock-count">{stockCount}</div>
      <button
        data-testid="add-stock"
        onClick={() => updateStockData(mockStockData)}
      >
        Add Stock
      </button>
      <button
        data-testid="remove-stock"
        onClick={() => removeStockData("005930")}
      >
        Remove Stock
      </button>
      <button data-testid="clear-all" onClick={clearAllStockData}>
        Clear All
      </button>
      {stockData["005930"] && (
        <div data-testid="stock-data">{stockData["005930"].name}</div>
      )}
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorProvider>
    <StockDataProvider>{children}</StockDataProvider>
  </ErrorProvider>
);

describe("StockDataContext", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Provider 없이 사용하면 에러가 발생한다", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useStockData must be used within a StockDataProvider");

    consoleSpy.mockRestore();
  });

  it("주식 데이터를 추가할 수 있다", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(screen.getByTestId("stock-count")).toHaveTextContent("0");

    act(() => {
      screen.getByTestId("add-stock").click();
    });

    expect(screen.getByTestId("stock-count")).toHaveTextContent("1");
    expect(screen.getByTestId("stock-data")).toHaveTextContent("삼성전자");
  });

  it("주식 데이터를 제거할 수 있다", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // 추가
    act(() => {
      screen.getByTestId("add-stock").click();
    });
    expect(screen.getByTestId("stock-count")).toHaveTextContent("1");

    // 제거
    act(() => {
      screen.getByTestId("remove-stock").click();
    });
    expect(screen.getByTestId("stock-count")).toHaveTextContent("0");
  });

  it("모든 주식 데이터를 제거할 수 있다", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    act(() => {
      screen.getByTestId("add-stock").click();
    });
    expect(screen.getByTestId("stock-count")).toHaveTextContent("1");

    act(() => {
      screen.getByTestId("clear-all").click();
    });
    expect(screen.getByTestId("stock-count")).toHaveTextContent("0");
  });

  it("getStockData로 특정 주식을 조회할 수 있다", () => {
    const GetTestComponent: React.FC = () => {
      const { updateStockData, getStockData } = useStockData();
      const [result, setResult] = React.useState<string>("none");

      const handleGet = () => {
        const data = getStockData("005930");
        setResult(data ? data.name : "null");
      };

      return (
        <div>
          <button
            data-testid="setup"
            onClick={() => updateStockData(mockStockData)}
          >
            Setup
          </button>
          <button data-testid="get" onClick={handleGet}>
            Get
          </button>
          <div data-testid="result">{result}</div>
        </div>
      );
    };

    render(
      <TestWrapper>
        <GetTestComponent />
      </TestWrapper>
    );

    act(() => {
      screen.getByTestId("setup").click();
    });

    act(() => {
      screen.getByTestId("get").click();
    });

    expect(screen.getByTestId("result")).toHaveTextContent("삼성전자");
  });

  it("존재하지 않는 주식 조회시 null을 반환한다", () => {
    const NullTestComponent: React.FC = () => {
      const { getStockData } = useStockData();
      const [result, setResult] = React.useState<string>("none");

      const handleGet = () => {
        const data = getStockData("999999");
        setResult(data ? "found" : "null");
      };

      return (
        <div>
          <button data-testid="get-null" onClick={handleGet}>
            Get Null
          </button>
          <div data-testid="result">{result}</div>
        </div>
      );
    };

    render(
      <TestWrapper>
        <NullTestComponent />
      </TestWrapper>
    );

    act(() => {
      screen.getByTestId("get-null").click();
    });

    expect(screen.getByTestId("result")).toHaveTextContent("null");
  });
});
