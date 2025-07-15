import { renderHook, act } from "@testing-library/react";
import { useStockOrder } from "../useStockOrder";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import { OrderFormData } from "@/types/domains/stock/hooks";
import { ApiResponse } from "@/types/common/api";

jest.mock("@/contexts/ErrorContext");
jest.mock("@/services/api/common/apiClient");

const mockUseError = useError as jest.MockedFunction<typeof useError>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockAddError = jest.fn();
const mockRemoveError = jest.fn();
const mockClearErrors = jest.fn();

const validOrderData: OrderFormData = {
  stockCode: "005930",
  orderType: "00", // 지정가
  quantity: "10",
  price: "70000",
};

const invalidStockCodeData: OrderFormData = {
  stockCode: "12345", // 5자리 (잘못된 형식)
  orderType: "00",
  quantity: "10",
  price: "70000",
};

const invalidQuantityData: OrderFormData = {
  stockCode: "005930",
  orderType: "00",
  quantity: "0", // 0 수량
  price: "70000",
};

const invalidPriceData: OrderFormData = {
  stockCode: "005930",
  orderType: "00", // 지정가인데 가격이 0
  quantity: "10",
  price: "0",
};

const marketOrderData: OrderFormData = {
  stockCode: "005930",
  orderType: "01", // 시장가
  quantity: "10",
  price: "", // 시장가는 가격 불필요
};

const createApiResponse = (hasError = false): ApiResponse => ({
  data: hasError ? undefined : { orderNumber: "12345" },
  error: hasError ? "주문 실패" : undefined,
  status: hasError ? 500 : 200,
});

describe("useStockOrder", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // console.error를 모킹하여 의도된 에러 로그 숨김
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    mockUseError.mockReturnValue({
      errors: [],
      addError: mockAddError,
      removeError: mockRemoveError,
      clearErrors: mockClearErrors,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("초기 상태", () => {
    it("초기값이 올바르게 설정되어야 한다", () => {
      const { result } = renderHook(() => useStockOrder());

      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.submitOrder).toBe("function");
      expect(typeof result.current.validateOrder).toBe("function");
    });
  });

  describe("validateOrder", () => {
    it("유효한 주문 데이터를 승인해야 한다", () => {
      const { result } = renderHook(() => useStockOrder());

      const validation = result.current.validateOrder(validOrderData);

      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it("잘못된 종목 코드를 거부해야 한다", () => {
      const { result } = renderHook(() => useStockOrder());

      const validation = result.current.validateOrder(invalidStockCodeData);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    it("잘못된 수량을 거부해야 한다", () => {
      const { result } = renderHook(() => useStockOrder());

      const validation = result.current.validateOrder(invalidQuantityData);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    it("지정가 주문에서 잘못된 가격을 거부해야 한다", () => {
      const { result } = renderHook(() => useStockOrder());

      const validation = result.current.validateOrder(invalidPriceData);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    it("시장가 주문에서 가격이 없어도 통과해야 한다", () => {
      const { result } = renderHook(() => useStockOrder());

      const validation = result.current.validateOrder(marketOrderData);

      expect(validation.isValid).toBe(true);
    });
  });

  describe("submitOrder", () => {
    it("유효한 주문이 성공해야 한다", async () => {
      mockApiClient.post.mockResolvedValue(createApiResponse(false));

      const { result } = renderHook(() => useStockOrder());

      await act(async () => {
        const success = await result.current.submitOrder(validOrderData);
        expect(success).toBe(true);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          pdno: "005930",
          ordDvsn: "00",
          ordQty: "10",
          ordUnpr: "70000",
        }),
        expect.objectContaining({
          requiresAuth: true,
          handleError: true,
        })
      );

      expect(mockAddError).toHaveBeenCalledWith({
        message: expect.stringContaining("성공"),
        severity: "info",
      });
    });

    it("잘못된 주문 데이터로 실패해야 한다", async () => {
      const { result } = renderHook(() => useStockOrder());

      await act(async () => {
        const success = await result.current.submitOrder(invalidStockCodeData);
        expect(success).toBe(false);
      });

      expect(mockApiClient.post).not.toHaveBeenCalled();
      expect(mockAddError).toHaveBeenCalledWith({
        message: expect.any(String),
        severity: "warning",
      });
    });

    it("API 에러 시 실패해야 한다", async () => {
      mockApiClient.post.mockResolvedValue(createApiResponse(true));

      const { result } = renderHook(() => useStockOrder());

      await act(async () => {
        const success = await result.current.submitOrder(validOrderData);
        expect(success).toBe(false);
      });

      expect(mockAddError).toHaveBeenCalledWith({
        message: expect.any(String),
        severity: "error",
      });

      // console.error가 호출되었는지 확인 (의도된 동작)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "주문 실행 중 오류:",
        expect.any(Error)
      );
    });

    it("로딩 상태가 올바르게 관리되어야 한다", async () => {
      let resolveApiCall: (value: ApiResponse) => void;
      const apiPromise = new Promise<ApiResponse>((resolve) => {
        resolveApiCall = resolve;
      });

      mockApiClient.post.mockReturnValue(apiPromise);

      const { result } = renderHook(() => useStockOrder());

      act(() => {
        result.current.submitOrder(validOrderData);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveApiCall!(createApiResponse(false));
        await apiPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("시장가 주문이 올바르게 처리되어야 한다", async () => {
      mockApiClient.post.mockResolvedValue(createApiResponse(false));

      const { result } = renderHook(() => useStockOrder());

      await act(async () => {
        const success = await result.current.submitOrder(marketOrderData);
        expect(success).toBe(true);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          ordDvsn: "01", // 시장가 코드
        }),
        expect.any(Object)
      );
    });
  });

  describe("에지 케이스", () => {
    it("빈 문자열 종목 코드를 거부해야 한다", () => {
      const { result } = renderHook(() => useStockOrder());

      const validation = result.current.validateOrder({
        ...validOrderData,
        stockCode: "",
      });

      expect(validation.isValid).toBe(false);
    });

    it("음수 수량을 거부해야 한다", () => {
      const { result } = renderHook(() => useStockOrder());

      const validation = result.current.validateOrder({
        ...validOrderData,
        quantity: "-10",
      });

      expect(validation.isValid).toBe(false);
    });

    it("소수점 수량을 거부해야 한다 (비즈니스 로직 개선)", () => {
      const { result } = renderHook(() => useStockOrder());

      const validation = result.current.validateOrder({
        ...validOrderData,
        quantity: "10.5",
      });

      // 주식 거래에서는 정수 수량만 허용
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe("주문 수량은 1 이상의 정수여야 합니다.");
    });

    it("추가 수량 검증 케이스", () => {
      const { result } = renderHook(() => useStockOrder());

      // 빈 문자열 수량
      expect(
        result.current.validateOrder({
          ...validOrderData,
          quantity: "",
        }).isValid
      ).toBe(false);

      // 공백 수량
      expect(
        result.current.validateOrder({
          ...validOrderData,
          quantity: " ",
        }).isValid
      ).toBe(false);

      // 문자 포함 수량
      expect(
        result.current.validateOrder({
          ...validOrderData,
          quantity: "10abc",
        }).isValid
      ).toBe(false);

      // NaN 수량
      expect(
        result.current.validateOrder({
          ...validOrderData,
          quantity: "NaN",
        }).isValid
      ).toBe(false);

      // Infinity 수량
      expect(
        result.current.validateOrder({
          ...validOrderData,
          quantity: "Infinity",
        }).isValid
      ).toBe(false);
    });
  });
});
