import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KisTokenForm from "../KisTokenForm";
import { apiClient } from "@/services/api/common/apiClient";
import { ErrorProvider } from "@/contexts/ErrorContext";

// API 호출 모킹
jest.mock("@/services/api/common/apiClient", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

// 컴포넌트를 ErrorProvider로 감싸는 헬퍼 함수
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ErrorProvider>{ui}</ErrorProvider>);
};

describe("KisTokenForm Component", () => {
  beforeEach(() => {
    // 각 테스트 전에 모킹된 함수 초기화
    jest.clearAllMocks();
  });

  test("renders form with all required fields", () => {
    renderWithProviders(<KisTokenForm userId={1} />);

    // 필수 필드들이 존재하는지 확인
    expect(screen.getByLabelText(/API Key:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Secret:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/계좌번호:/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /토큰 발급받기/i })
    ).toBeInTheDocument();
  });

  test("validates form fields on submit", async () => {
    // 에러 메시지를 캡처하기 위한 모의 함수
    const mockAddError = jest.fn();
    jest.mock("@/contexts/ErrorContext", () => ({
      ...jest.requireActual("@/contexts/ErrorContext"),
      useError: () => ({
        addError: mockAddError,
      }),
    }));

    renderWithProviders(<KisTokenForm userId={1} />);

    // 빈 폼 제출 시도
    const submitButton = screen.getByRole("button", { name: /토큰 발급받기/i });
    fireEvent.click(submitButton);

    // 상태 업데이트 기다림
    await waitFor(() => {
      // 폼 유효성 검사 오류 메시지가 표시되는지 확인
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("API 키를 입력해주세요"),
          severity: "warning",
        })
      );
    });
  });

  test("submits form with valid data", async () => {
    // API 호출 성공 시뮬레이션
    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { accessToken: "test-token" },
      error: undefined,
      status: 200,
    });

    renderWithProviders(<KisTokenForm userId={1} />);

    // 폼 필드 채우기
    await userEvent.type(screen.getByLabelText(/API Key:/i), "test-app-key");
    await userEvent.type(
      screen.getByLabelText(/API Secret:/i),
      "test-app-secret"
    );
    await userEvent.type(screen.getByLabelText(/계좌번호:/i), "12345678");

    // 폼 제출
    const submitButton = screen.getByRole("button", { name: /토큰 발급받기/i });
    fireEvent.click(submitButton);

    // API가 올바른 데이터로 호출되었는지 확인
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        {
          appKey: "test-app-key",
          appSecret: "test-app-secret",
          accountNumber: "12345678",
        },
        expect.any(Object)
      );
    });
  });
});
