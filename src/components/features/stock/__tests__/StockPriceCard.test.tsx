import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import StockPriceCard from "@/components/features/stock/StockPriceCard";
import { StockTransaction } from "@/types";
import { useStockData } from "@/contexts/StockDataContext";
import { useError } from "@/contexts/ErrorContext";

jest.mock("@/components/features/stock/StockMiniChart", () => {
  return jest.fn(() => (
    <div data-testid="mock-stock-mini-chart">차트 컴포넌트</div>
  ));
});

jest.mock("@/contexts/StockDataContext", () => ({
  useStockData: jest.fn(),
}));

jest.mock("@/contexts/ErrorContext", () => ({
  useError: jest.fn(),
}));

jest.mock("@/constants", () => ({
  ERROR_MESSAGES: {
    REALTIME: {
      UNSUBSCRIBE_FAIL: jest.fn(
        (symbol) => `종목 ${symbol} 구독 취소에 실패했습니다.`
      ),
    },
  },
  TIMINGS: {
    STOCK_PRICE_CHECK_INTERVAL: 10,
  },
  ANIMATIONS: {
    BLINK_DURATION: 50,
  },
}));

describe("StockPriceCard", () => {
  const mockStockData: StockTransaction = {
    symbol: "005930",
    price: 76000,
    priceChange: 1300,
    changeType: "상승",
    changeRate: 1.72,
    volume: 7388353,
    totalVolume: 10000000,
    transactionTime: new Date().toISOString(),
  };

  const mockGetStockData = jest.fn();
  const mockGetChartData = jest.fn().mockReturnValue([]);
  const mockUnsubscribeSymbol = jest.fn().mockResolvedValue(true);
  const mockAddError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useStockData as jest.Mock).mockReturnValue({
      getStockData: mockGetStockData,
      unsubscribeSymbol: mockUnsubscribeSymbol,
      getChartData: mockGetChartData,
    });

    (useError as jest.Mock).mockReturnValue({
      addError: mockAddError,
    });

    mockGetStockData.mockReturnValue(mockStockData);
  });

  test("renders stock information correctly", () => {
    render(<StockPriceCard symbol="005930" />);

    // 종목 코드가 잘 표시되는지 확인
    expect(screen.getByText("005930")).toBeInTheDocument();

    // 가격 정보가 올바르게 표시되는지 확인
    expect(screen.getByText(/76,000 원/)).toBeInTheDocument();
    expect(screen.getByText(/\+1,300 원 \(1.72%\)/)).toBeInTheDocument();

    // 거래량 정보가 올바르게 포맷팅되어 표시되는지 확인
    expect(screen.getByText(/거래량:/)).toBeInTheDocument();
  });

  test("shows loading state when stock data is not available", () => {
    mockGetStockData.mockReturnValueOnce(null);

    render(<StockPriceCard symbol="005930" />);

    expect(screen.getByText("데이터 로딩중...")).toBeInTheDocument();
  });

  test("calls unsubscribeSymbol when the unsubscribe button is clicked", async () => {
    render(<StockPriceCard symbol="005930" />);

    const unsubscribeButton = screen.getByTitle("구독 취소");

    await act(async () => {
      fireEvent.click(unsubscribeButton);
    });

    expect(mockUnsubscribeSymbol).toHaveBeenCalledWith("005930");
  });

  test("updates stockData when new data is received", async () => {
    const { rerender } = render(<StockPriceCard symbol="005930" />);

    // 초기 가격
    expect(screen.getByText(/76,000 원/)).toBeInTheDocument();

    // 새 가격 데이터 설정
    const updatedStock = {
      ...mockStockData,
      price: 77000,
      priceChange: 2300,
      changeRate: 3.07,
    };

    mockGetStockData.mockReturnValue(updatedStock);

    rerender(<StockPriceCard symbol="005930" />);

    // 새 가격이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText(/77,000 원/)).toBeInTheDocument();
      expect(screen.getByText(/\+2,300 원 \(3.07%\)/)).toBeInTheDocument();
    });
  });

  test("handles unsubscribe error correctly", async () => {
    mockUnsubscribeSymbol.mockRejectedValueOnce(new Error("구독 취소 실패"));

    render(<StockPriceCard symbol="005930" />);

    const unsubscribeButton = screen.getByTitle("구독 취소");

    await act(async () => {
      fireEvent.click(unsubscribeButton);
    });

    await waitFor(() => {
      expect(mockAddError).toHaveBeenCalledWith({
        message: expect.stringContaining("005930"),
        severity: "error",
      });
    });
  });
});
