import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuthContext } from "../AuthContext";
import { ErrorProvider } from "../ErrorContext";
import { authService } from "@/services/api/auth/authService";
import { tokenStorage } from "@/services/api/auth/tokenStorage";

// 모킹
jest.mock("next/navigation");
jest.mock("@/services/api/auth/authService");
jest.mock("@/services/api/auth/tokenStorage");

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// 테스트용 컴포넌트
const TestComponent: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout, checkAuth } =
    useAuthContext();

  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="user-name">{user?.name || "no-user"}</div>
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
      <button data-testid="check-auth" onClick={checkAuth}>
        Check Auth
      </button>
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorProvider>
    <AuthProvider>{children}</AuthProvider>
  </ErrorProvider>
);

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Provider 없이 사용하면 에러가 발생한다", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAuthContext must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });

  it("초기 상태에서 인증되지 않은 상태로 시작한다", async () => {
    // 토큰이 없는 상태 모킹
    mockTokenStorage.getAccessToken.mockReturnValue(null);
    mockTokenStorage.isAccessTokenExpiringSoon.mockReturnValue(false);
    mockAuthService.initializeAuth.mockResolvedValue({
      success: false,
      needsLogin: true,
    });
    mockAuthService.checkAuth.mockResolvedValue({
      status: 401,
      error: "No token",
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // 초기에는 로딩 상태
    expect(screen.getByTestId("is-loading")).toHaveTextContent("true");

    // 인증 확인 후 로딩 완료
    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user-name")).toHaveTextContent("no-user");
  });

  it("유효한 토큰이 있으면 인증된 상태가 된다", async () => {
    const mockUser = { id: "1", name: "홍길동", email: "test@test.com" };

    // 유효한 토큰 상태 모킹
    mockTokenStorage.getAccessToken.mockReturnValue("valid-token");
    mockTokenStorage.isAccessTokenExpiringSoon.mockReturnValue(false);
    mockAuthService.checkAuth.mockResolvedValue({
      status: 200,
      data: { user: mockUser, isAuthenticated: true },
      error: undefined,
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user-name")).toHaveTextContent("홍길동");
  });

  it("토큰이 만료 임박시 토큰 갱신을 시도한다", async () => {
    const mockUser = { id: "1", name: "홍길동", email: "test@test.com" };

    // 만료 임박 토큰 상태 모킹
    mockTokenStorage.getAccessToken.mockReturnValue("expiring-token");
    mockTokenStorage.isAccessTokenExpiringSoon.mockReturnValue(true);
    mockAuthService.initializeAuth.mockResolvedValue({
      success: true,
      needsLogin: false,
    });
    mockAuthService.checkAuth.mockResolvedValue({
      status: 200,
      data: { user: mockUser, isAuthenticated: true },
      error: undefined,
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
    });

    expect(mockAuthService.initializeAuth).toHaveBeenCalled();
    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
  });

  it("로그아웃이 정상적으로 동작한다", async () => {
    const mockUser = { id: "1", name: "홍길동", email: "test@test.com" };

    // 초기 인증 상태 설정
    mockTokenStorage.getAccessToken.mockReturnValue("valid-token");
    mockTokenStorage.isAccessTokenExpiringSoon.mockReturnValue(false);
    mockAuthService.checkAuth.mockResolvedValue({
      status: 200,
      data: { user: mockUser, isAuthenticated: true },
      error: undefined,
    });
    mockAuthService.logout.mockResolvedValue({
      status: 200,
      error: undefined,
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // 인증 상태 확인
    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    });

    // 로그아웃 실행
    act(() => {
      screen.getByTestId("logout").click();
    });

    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockTokenStorage.clearAccessToken).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user-name")).toHaveTextContent("no-user");
  });

  it("checkAuth를 수동으로 호출할 수 있다", async () => {
    const mockUser = { id: "1", name: "홍길동", email: "test@test.com" };

    // 초기에는 인증되지 않은 상태
    mockTokenStorage.getAccessToken.mockReturnValue(null);
    mockAuthService.initializeAuth.mockResolvedValue({
      success: false,
      needsLogin: true,
    });
    mockAuthService.checkAuth.mockResolvedValue({
      status: 401,
      error: "No token",
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // 초기 상태 확인
    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    });

    // Mock을 새로운 인증된 상태로 변경 (토큰이 갱신되었다고 가정)
    mockTokenStorage.getAccessToken.mockReturnValue("new-token");
    mockAuthService.initializeAuth.mockResolvedValue({
      success: true,
      needsLogin: false,
    });
    mockAuthService.checkAuth.mockResolvedValue({
      status: 200,
      data: { user: mockUser, isAuthenticated: true },
      error: undefined,
    });

    // 수동 인증 확인 호출
    act(() => {
      screen.getByTestId("check-auth").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("user-name")).toHaveTextContent("홍길동");
    });
  });

  it("인증 실패시 로그인 페이지로 리다이렉트한다", async () => {
    // 인증 실패 상태 모킹
    mockTokenStorage.getAccessToken.mockReturnValue(null);
    mockAuthService.initializeAuth.mockResolvedValue({
      success: false,
      needsLogin: true,
    });
    mockAuthService.checkAuth.mockResolvedValue({
      status: 401,
      error: "Authentication failed",
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/login?sessionExpired=true"
      );
    });
  });

  it("토큰 갱신 실패시에도 로그인 페이지로 리다이렉트한다", async () => {
    // 토큰 갱신 실패 모킹
    mockTokenStorage.getAccessToken.mockReturnValue("expiring-token");
    mockTokenStorage.isAccessTokenExpiringSoon.mockReturnValue(true);
    mockAuthService.initializeAuth.mockResolvedValue({
      success: false,
      needsLogin: true,
    });
    mockAuthService.checkAuth.mockResolvedValue({
      status: 401,
      error: "Token refresh failed",
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/login?sessionExpired=true"
      );
    });
  });
});
