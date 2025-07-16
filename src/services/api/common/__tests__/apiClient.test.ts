import { apiClient } from "../apiClient";
import { ErrorService } from "@/services/error/errorService";
import { authService } from "@/services/api/auth/authService";
import { tokenStorage } from "@/services/api/auth/tokenStorage";
import { requestQueue } from "../requestQueue";
import { ERROR_CODES } from "@/types/common/error";

jest.mock("@/services/error/errorService");
jest.mock("@/services/api/auth/authService");
jest.mock("@/services/api/auth/tokenStorage");
jest.mock("../requestQueue");

const mockFetch = jest.fn();
global.fetch = mockFetch;

Object.defineProperty(global, "AbortSignal", {
  value: { timeout: jest.fn().mockReturnValue({ aborted: false }) },
  writable: true,
});

const mockErrorService = ErrorService as jest.Mocked<typeof ErrorService>;
const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;
const mockRequestQueue = requestQueue as jest.Mocked<typeof requestQueue>;

describe("ApiClient", () => {
  let mockErrorHandler: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockErrorHandler = jest.fn();
    apiClient.setErrorHandler(mockErrorHandler);

    mockTokenStorage.getAccessToken.mockReturnValue("test-token");
    mockTokenStorage.isAccessTokenExpiringSoon.mockReturnValue(false);
    mockAuthService.silentRefresh.mockResolvedValue(true);
    mockRequestQueue.add.mockImplementation(async (fn) => await fn());

    mockErrorService.fromHttpStatus.mockReturnValue({
      code: ERROR_CODES.SYSTEM_UNKNOWN,
      message: "테스트 에러",
      severity: "error",
    });
  });

  describe("HTTP 메서드", () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ success: true }),
      });
    });

    it("GET 요청을 처리한다", async () => {
      const response = await apiClient.get("/test");

      expect(mockRequestQueue.add).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
      expect(response.data).toEqual({ success: true });
    });

    it("POST 요청을 처리한다", async () => {
      const testData = { name: "테스트" };
      await apiClient.post("/test", testData);

      expect(mockFetch).toHaveBeenCalledWith(
        "/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(testData),
        })
      );
    });
  });

  describe("인증 처리", () => {
    it("토큰이 없을 때 인증 에러를 반환한다", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({}),
      });
      mockTokenStorage.getAccessToken.mockReturnValue(null);

      const response = await apiClient.get("/protected");

      expect(response.error).toBe("인증이 필요합니다. 다시 로그인해주세요.");
      expect(response.status).toBe(401);
    });

    it("401 에러 시 토큰 갱신 후 재시도한다", async () => {
      // 토큰은 있지만 서버에서 401 에러가 발생하는 상황
      mockTokenStorage.getAccessToken.mockReturnValue("expired-token");

      // ensureValidToken에서 실제로 갱신을 시도하도록 설정
      mockTokenStorage.isAccessTokenExpiringSoon.mockReturnValue(true);
      mockAuthService.silentRefresh.mockResolvedValue(true);

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: jest.fn().mockResolvedValue({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ success: true }),
        });

      const response = await apiClient.get("/protected");

      expect(mockAuthService.silentRefresh).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(response.data).toEqual({ success: true });
    });
  });

  describe("에러 처리", () => {
    it("HTTP 에러를 처리한다", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: "잘못된 요청" }),
      });

      const response = await apiClient.get("/error");

      expect(response.error).toBe("잘못된 요청");
      expect(response.status).toBe(400);
    });

    it("에러 핸들러를 호출한다", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ message: "서버 에러" }),
      });

      await apiClient.get("/error");

      expect(mockErrorService.fromHttpStatus).toHaveBeenCalledWith(
        500,
        "서버 에러"
      );
      expect(mockErrorHandler).toHaveBeenCalled();
    });

    it("네트워크 에러를 처리한다", async () => {
      // requestQueue.add에서 에러를 reject하도록 설정
      mockRequestQueue.add.mockRejectedValue(new Error("Network error"));

      try {
        await apiClient.get("/network-error");
        fail("에러가 발생해야 합니다");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Network error");
      }
    });
  });

  describe("요청 옵션", () => {
    it("인증이 불필요한 요청을 처리한다", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      });

      await apiClient.get("/public", { requiresAuth: false });

      expect(mockFetch).toHaveBeenCalledWith(
        "/public",
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });

    it("커스텀 헤더를 추가한다", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      });

      await apiClient.get("/custom", {
        headers: { "X-Custom": "value" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "/custom",
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Custom": "value",
          }),
        })
      );
    });
  });
});
