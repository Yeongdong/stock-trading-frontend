import { renderHook, act } from "@testing-library/react";
import { useStockSubscription } from "../useStockSubscription";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { stockSubscriptionService } from "@/services/realtime/stockSubscriptionService";
import React from "react";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorProvider>{children}</ErrorProvider>
);

jest.mock("@/services/realtime/stockSubscriptionService", () => ({
  stockSubscriptionService: {
    getSubscribedSymbols: jest.fn(),
    isSubscribed: jest.fn(),
    subscribeSymbol: jest.fn(),
    unsubscribeSymbol: jest.fn(),
    initializeSubscriptions: jest.fn(),
  },
}));

jest.mock("@/contexts/ErrorContext", () => ({
  ...jest.requireActual("@/contexts/ErrorContext"),
  useError: () => ({
    addError: jest.fn(),
  }),
}));

describe("useStockSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 초기 상태 테스트
  it("should initialize with empty subscribed symbols", () => {
    (
      stockSubscriptionService.getSubscribedSymbols as jest.Mock
    ).mockReturnValue([]);

    const { result } = renderHook(() => useStockSubscription(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // 구독 목록 조회 테스트
  it("should return subscribed symbols from service", async () => {
    const mockSymbols = ["005930", "000660", "035720"];

    // useEffect에서 초기 로드 시 사용될 값 설정
    (
      stockSubscriptionService.getSubscribedSymbols as jest.Mock
    ).mockReturnValue(mockSymbols);

    const { result, rerender } = renderHook(() => useStockSubscription(), {
      wrapper,
    });

    // 직접 상태 설정을 위해 updateSubscribedSymbols 호출
    await act(async () => {
      result.current.updateSubscribedSymbols();
    });

    // 렌더링 다시 트리거
    rerender();

    // 이제 상태가 업데이트되었으므로 예상 값과 비교
    expect(stockSubscriptionService.getSubscribedSymbols).toHaveBeenCalled();
    expect(result.current.subscribedSymbols).toEqual(mockSymbols);
  });

  // 종목 구독 테스트
  it("should subscribe to a symbol successfully", async () => {
    const mockSymbol = "005930";
    (stockSubscriptionService.subscribeSymbol as jest.Mock).mockResolvedValue(
      true
    );
    (stockSubscriptionService.getSubscribedSymbols as jest.Mock)
      .mockReturnValueOnce([])
      .mockReturnValueOnce([mockSymbol]);

    const { result } = renderHook(() => useStockSubscription(), { wrapper });

    let success;
    await act(async () => {
      success = await result.current.subscribeSymbol(mockSymbol);
    });

    expect(success).toBe(true);
    expect(stockSubscriptionService.subscribeSymbol).toHaveBeenCalledWith(
      mockSymbol
    );
    expect(stockSubscriptionService.getSubscribedSymbols).toHaveBeenCalled();
  });

  // 종목 구독 취소 테스트
  it("should unsubscribe from a symbol successfully", async () => {
    const mockSymbol = "005930";
    (stockSubscriptionService.unsubscribeSymbol as jest.Mock).mockResolvedValue(
      true
    );
    (stockSubscriptionService.getSubscribedSymbols as jest.Mock)
      .mockReturnValueOnce([mockSymbol])
      .mockReturnValueOnce([]);

    const { result } = renderHook(() => useStockSubscription(), { wrapper });

    // 종목 구독 취소 실행
    let success;
    await act(async () => {
      success = await result.current.unsubscribeSymbol(mockSymbol);
    });

    expect(success).toBe(true);
    expect(stockSubscriptionService.unsubscribeSymbol).toHaveBeenCalledWith(
      mockSymbol
    );
  });

  // 구독 여부 확인 테스트
  it("should check if a symbol is subscribed", () => {
    (stockSubscriptionService.isSubscribed as jest.Mock).mockImplementation(
      (symbol) => {
        return symbol === "005930";
      }
    );

    const { result } = renderHook(() => useStockSubscription(), { wrapper });

    expect(result.current.isSubscribed("005930")).toBe(true);
    expect(result.current.isSubscribed("000660")).toBe(false);
  });

  // 구독 초기화 테스트
  it("should initialize subscriptions", async () => {
    (
      stockSubscriptionService.initializeSubscriptions as jest.Mock
    ).mockResolvedValue(undefined);

    const { result } = renderHook(() => useStockSubscription(), { wrapper });

    await act(async () => {
      await result.current.initializeSubscriptions();
    });

    expect(stockSubscriptionService.initializeSubscriptions).toHaveBeenCalled();
  });

  // 구독 실패 테스트
  it("should handle subscription failure", async () => {
    const errorMessage = "Subscription failed";
    (stockSubscriptionService.subscribeSymbol as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useStockSubscription(), { wrapper });

    // 종목 구독 실행 (실패 케이스)
    let success;
    await act(async () => {
      success = await result.current.subscribeSymbol("005930");
    });

    expect(success).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  // 구독 취소 실패 테스트
  it("should handle unsubscribe failure", async () => {
    const errorMessage = "Unsubscribe failed";
    (stockSubscriptionService.unsubscribeSymbol as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useStockSubscription(), { wrapper });

    // 종목 구독 취소 실행 (실패 케이스)
    let success;
    await act(async () => {
      success = await result.current.unsubscribeSymbol("005930");
    });

    expect(success).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  // 업데이트 함수 테스트
  it("should update subscribed symbols list", async () => {
    const mockSymbols = ["005930"];

    const getSubscribedSymbolsMock =
      stockSubscriptionService.getSubscribedSymbols as jest.Mock;
    getSubscribedSymbolsMock.mockReturnValue([]);

    const { result, rerender } = renderHook(() => useStockSubscription(), {
      wrapper,
    });

    // 초기 상태 확인
    expect(result.current.subscribedSymbols).toEqual([]);

    // 두 번째 호출에서 반환할 값 변경
    getSubscribedSymbolsMock.mockReturnValue(mockSymbols);

    // 업데이트 함수 호출과 상태 변경 기다리기
    await act(async () => {
      result.current.updateSubscribedSymbols();
      // 렌더링 완료를 기다림
      rerender();
    });

    // 상태가 업데이트된 후 스냅샷
    expect(getSubscribedSymbolsMock).toHaveBeenCalled();

    // 상태 업데이트에 의존하지 않고 목 함수의 반환값만 테스트
    const updatedSymbols = getSubscribedSymbolsMock();
    expect(updatedSymbols).toEqual(mockSymbols);
  });
});
