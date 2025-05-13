import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KisTokenForm from "../KisTokenForm";
import { apiClient } from "@/services/api/common/apiClient";

// API 호출 모킹
jest.mock("@/services/api/common/apiClient", () => ({
  apiClient: {
    post: jest.fn().mockResolvedValue({
      data: { accessToken: "test-token" },
      error: undefined,
      status: 200,
    }),
  },
}));

const mockAddError = jest.fn();
jest.mock("@/contexts/ErrorContext", () => {
  const originalModule = jest.requireActual("@/contexts/ErrorContext");
  return {
    ...originalModule,
    useError: () => ({
      addError: mockAddError,
      errors: [],
      removeError: jest.fn(),
      clearErrors: jest.fn(),
    }),
  };
});

describe("KisTokenForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form with all required fields", () => {
    render(<KisTokenForm userId={1} />);

    expect(screen.getByLabelText(/API Key:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Secret:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/계좌번호:/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /토큰 발급받기/i })
    ).toBeInTheDocument();
  });

  test("validates form fields on submit", async () => {
    render(<KisTokenForm userId={1} />);

    // 빈 폼 제출 시도
    const submitButton = screen.getByRole("button", { name: /토큰 발급받기/i });
    fireEvent.click(submitButton);

    // 상태 업데이트 기다림
    await waitFor(() => {
      // 폼 유효성 검사 오류 메시지가 표시되는지 확인
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/API 키를 입력해주세요/),
          severity: "warning",
        })
      );
    });
  });

  test("submits form with valid data", async () => {
    render(<KisTokenForm userId={1} />);

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
      expect(apiClient.post).toHaveBeenCalled();

      const calls = (apiClient.post as jest.Mock).mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      const [, requestBody] = calls[0];
      expect(requestBody).toEqual({
        appKey: "test-app-key",
        appSecret: "test-app-secret",
        accountNumber: "12345678",
      });
    });
  });
});
