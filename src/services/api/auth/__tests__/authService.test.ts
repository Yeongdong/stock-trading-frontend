import { authService } from "../authService";
import { apiClient } from "@/services/api/common/apiClient";
import { tokenStorage } from "../tokenStorage";
import { API } from "@/constants";

jest.mock("@/services/api/common/apiClient");
jest.mock("../tokenStorage");

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("googleLogin", () => {
    const validCredential = "header.payload.signature";
    const mockResponse = {
      status: 200,
      data: {
        accessToken: "token",
        expiresIn: 3600,
        user: { id: "1", email: "test@test.com" },
        isAuthenticated: true,
      },
    };

    it("성공적으로 로그인하고 토큰을 저장한다", async () => {
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.googleLogin(validCredential);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API.AUTH.GOOGLE_LOGIN,
        { Credential: validCredential },
        { requiresAuth: false }
      );
      expect(mockTokenStorage.setAccessToken).toHaveBeenCalledWith(
        "token",
        3600
      );
      expect(result).toBe(mockResponse);
    });

    it("빈 credential 시 400 에러를 반환한다", async () => {
      const result = await authService.googleLogin("");
      expect(result).toEqual({ status: 400, error: "인증 정보가 필요합니다." });
    });

    it("잘못된 JWT 형식 시 400 에러를 반환한다", async () => {
      const result = await authService.googleLogin("invalid.jwt");
      expect(result).toEqual({
        status: 400,
        error: "유효하지 않은 인증 정보입니다.",
      });
    });

    it("토큰이 없는 응답 시 저장하지 않는다", async () => {
      mockApiClient.post.mockResolvedValue({
        status: 200,
        data: { accessToken: "", expiresIn: 3600 },
      });
      await authService.googleLogin(validCredential);
      expect(mockTokenStorage.setAccessToken).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("로그아웃하고 토큰을 정리한다", async () => {
      const mockResponse = { status: 200 };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API.AUTH.LOGOUT,
        {},
        { requiresAuth: true }
      );
      expect(mockTokenStorage.clearAccessToken).toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });
  });

  describe("refreshAccessToken", () => {
    it("성공적으로 토큰을 갱신한다", async () => {
      const mockResponse = {
        status: 200,
        data: { accessToken: "new-token", expiresIn: 7200 },
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshAccessToken();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API.AUTH.REFRESH,
        {},
        { requiresAuth: false }
      );
      expect(mockTokenStorage.setAccessToken).toHaveBeenCalledWith(
        "new-token",
        7200
      );
      expect(result).toBe(mockResponse);
    });

    it("expiresIn이 없을 때 기본값 3600을 사용한다", async () => {
      mockApiClient.post.mockResolvedValue({
        status: 200,
        data: { accessToken: "token", expiresIn: 0 },
      });
      await authService.refreshAccessToken();
      expect(mockTokenStorage.setAccessToken).toHaveBeenCalledWith(
        "token",
        3600
      );
    });
  });

  describe("silentRefresh", () => {
    it("갱신 성공 시 true를 반환한다", async () => {
      mockApiClient.post.mockResolvedValue({
        status: 200,
        data: { accessToken: "token", expiresIn: 3600 },
      });
      const result = await authService.silentRefresh();
      expect(result).toBe(true);
    });

    it("갱신 실패 시 false를 반환한다", async () => {
      mockApiClient.post.mockResolvedValue({
        status: 401,
        error: "Token expired",
      });
      const result = await authService.silentRefresh();
      expect(result).toBe(false);
    });
  });

  describe("initializeAuth", () => {
    it("유효한 토큰이 있으면 성공을 반환한다", async () => {
      mockTokenStorage.getAccessToken.mockReturnValue("valid-token");
      mockTokenStorage.isAccessTokenExpiringSoon.mockReturnValue(false);

      const result = await authService.initializeAuth();

      expect(result).toEqual({ success: true, needsLogin: false });
    });

    it("401/403 오류 시 로그인이 필요함을 반환한다", async () => {
      mockTokenStorage.getAccessToken.mockReturnValue(null);
      mockApiClient.post.mockResolvedValue({
        status: 401,
        error: "Unauthorized",
      });

      const result = await authService.initializeAuth();

      expect(result).toEqual({ success: false, needsLogin: true });
      expect(mockTokenStorage.clearAccessToken).toHaveBeenCalled();
    });

    it("네트워크 오류 시 재시도 가능으로 반환한다", async () => {
      mockTokenStorage.getAccessToken.mockReturnValue(null);
      mockApiClient.post.mockResolvedValue({
        status: 500,
        error: "Server Error",
      });

      const result = await authService.initializeAuth();

      expect(result).toEqual({ success: false, needsLogin: false });
    });
  });
});
