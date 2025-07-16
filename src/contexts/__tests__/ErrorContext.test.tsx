import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { ErrorProvider, useError } from "../ErrorContext";

const TestComponent: React.FC = () => {
  const { errors, addError, removeError, clearErrors } = useError();

  return (
    <div>
      <div data-testid="error-count">{errors.length}</div>
      <div data-testid="errors">
        {errors.map((error) => (
          <div key={error.id} data-testid={`error-${error.id}`}>
            {error.message}
          </div>
        ))}
      </div>
      <button
        data-testid="add-error"
        onClick={() =>
          addError({
            message: "Test error",
            severity: "error",
          })
        }
      >
        Add Error
      </button>
      <button
        data-testid="add-error-with-code"
        onClick={() =>
          addError({
            message: "Test error with code",
            code: "TEST_CODE",
            severity: "warning",
          })
        }
      >
        Add Error with Code
      </button>
      <button
        data-testid="remove-first-error"
        onClick={() => {
          if (errors.length > 0) {
            removeError(errors[0].id);
          }
        }}
      >
        Remove First Error
      </button>
      <button data-testid="clear-errors" onClick={clearErrors}>
        Clear All Errors
      </button>
    </div>
  );
};

const TestComponentWithoutProvider: React.FC = () => {
  const { errors } = useError();
  return <div>{errors.length}</div>;
};

describe("ErrorContext", () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Provider 설정", () => {
    it("Provider 없이 useError를 사용하면 에러가 발생해야 한다", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow();

      consoleSpy.mockRestore();
    });

    it("Provider가 있으면 정상적으로 렌더링되어야 한다", () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      expect(screen.getByTestId("error-count")).toHaveTextContent("0");
    });
  });

  describe("기본 에러 관리", () => {
    it("에러를 추가할 수 있어야 한다", () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      act(() => {
        screen.getByTestId("add-error").click();
      });

      expect(screen.getByTestId("error-count")).toHaveTextContent("1");
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });

    it("에러 코드와 함께 에러를 추가할 수 있어야 한다", () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      act(() => {
        screen.getByTestId("add-error-with-code").click();
      });

      expect(screen.getByTestId("error-count")).toHaveTextContent("1");
      expect(screen.getByText("Test error with code")).toBeInTheDocument();
    });

    it("특정 에러를 제거할 수 있어야 한다", () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      act(() => {
        screen.getByTestId("add-error").click();
      });

      expect(screen.getByTestId("error-count")).toHaveTextContent("1");

      act(() => {
        screen.getByTestId("remove-first-error").click();
      });

      expect(screen.getByTestId("error-count")).toHaveTextContent("0");
    });

    it("모든 에러를 제거할 수 있어야 한다", () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      act(() => {
        screen.getByTestId("add-error").click();
        screen.getByTestId("add-error-with-code").click();
      });

      expect(screen.getByTestId("error-count")).toHaveTextContent("2");

      act(() => {
        screen.getByTestId("clear-errors").click();
      });

      expect(screen.getByTestId("error-count")).toHaveTextContent("0");
    });
  });

  describe("자동 에러 제거", () => {
    it("10초 후에 에러가 자동으로 제거되어야 한다", async () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      // 에러 추가
      act(() => {
        screen.getByTestId("add-error").click();
      });

      expect(screen.getByTestId("error-count")).toHaveTextContent("1");

      // 11초 경과 (10초 + 1초 체크 간격)
      act(() => {
        jest.advanceTimersByTime(11000);
      });

      await waitFor(() => {
        expect(screen.getByTestId("error-count")).toHaveTextContent("0");
      });
    });

    it("10초 이내의 새로운 에러는 제거되지 않아야 한다", async () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      // 첫 번째 에러 추가
      act(() => {
        screen.getByTestId("add-error").click();
      });

      // 5초 경과
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // 두 번째 에러 추가
      act(() => {
        screen.getByTestId("add-error-with-code").click();
      });

      // 추가로 6초 경과 (첫 번째 에러는 11초, 두 번째 에러는 6초)
      act(() => {
        jest.advanceTimersByTime(6000);
      });

      await waitFor(() => {
        expect(screen.getByTestId("error-count")).toHaveTextContent("1");
        expect(screen.getByText("Test error with code")).toBeInTheDocument();
      });
    });

    it("에러 제거 로직이 올바르게 동작한다", async () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      // 첫 번째 에러
      act(() => {
        screen.getByTestId("add-error").click();
      });

      // 2초 후 두 번째 에러
      act(() => {
        jest.advanceTimersByTime(2000);
        screen.getByTestId("add-error-with-code").click();
      });

      expect(screen.getByTestId("error-count")).toHaveTextContent("2");

      // 9초 더 경과 (첫 번째 에러 11초, 두 번째 에러 9초)
      act(() => {
        jest.advanceTimersByTime(9000);
      });

      // 첫 번째 에러만 제거되어야 함
      await waitFor(() => {
        expect(screen.getByTestId("error-count")).toHaveTextContent("1");
        expect(screen.getByText("Test error with code")).toBeInTheDocument();
      });

      // 추가로 2초 경과 (두 번째 에러도 11초)
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // 모든 에러 제거
      await waitFor(() => {
        expect(screen.getByTestId("error-count")).toHaveTextContent("0");
      });
    });
  });

  describe("에러 속성", () => {
    it("에러에 타임스탬프가 포함되어야 한다", () => {
      const TestTimestampComponent: React.FC = () => {
        const { errors, addError } = useError();

        React.useEffect(() => {
          addError({ message: "Test error", severity: "error" });
        }, [addError]);

        return (
          <div data-testid="has-timestamp">
            {errors.length > 0 && errors[0].timestamp instanceof Date
              ? "true"
              : "false"}
          </div>
        );
      };

      render(
        <ErrorProvider>
          <TestTimestampComponent />
        </ErrorProvider>
      );

      expect(screen.getByTestId("has-timestamp")).toHaveTextContent("true");
    });

    it("에러 객체가 올바른 구조를 가져야 한다", () => {
      const TestErrorStructureComponent: React.FC = () => {
        const { errors, addError } = useError();

        React.useEffect(() => {
          addError({
            message: "Test message",
            code: "TEST_CODE",
            severity: "warning",
          });
        }, [addError]);

        if (errors.length === 0)
          return <div data-testid="no-errors">No errors</div>;

        const error = errors[0];
        const hasRequiredFields = !!(
          error.id &&
          error.message &&
          error.severity &&
          error.timestamp
        );

        return (
          <div data-testid="has-structure">{hasRequiredFields.toString()}</div>
        );
      };

      render(
        <ErrorProvider>
          <TestErrorStructureComponent />
        </ErrorProvider>
      );

      expect(screen.getByTestId("has-structure")).toHaveTextContent("true");
    });
  });
});
