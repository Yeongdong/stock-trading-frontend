import React, { ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ErrorProvider } from "../ErrorContext";

/**
 * 테스트용 컨텍스트 래퍼
 * 각 컨텍스트 테스트에서 필요한 Provider들을 조합하여 사용
 */
interface TestWrapperProps {
  children: ReactNode;
  providers?: React.ComponentType<{ children: ReactNode }>[];
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  providers = [],
}) => {
  // providers 배열을 역순으로 순회하여 중첩된 Provider 구조 생성
  return providers.reduceRight((acc, Provider) => {
    const WrappedProvider = () => <Provider>{acc}</Provider>;
    WrappedProvider.displayName = `TestProvider(${
      Provider.displayName || Provider.name
    })`;
    return <WrappedProvider />;
  }, children);
};

TestWrapper.displayName = "TestWrapper";

/**
 * 기본 ErrorProvider가 포함된 테스트 래퍼
 */
export const createTestWrapper = (
  additionalProviders: React.ComponentType<{ children: ReactNode }>[] = []
) => {
  const providers = [ErrorProvider, ...additionalProviders];

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestWrapper providers={providers}>{children}</TestWrapper>
  );

  Wrapper.displayName = "TestContextWrapper";

  return Wrapper;
};

/**
 * 커스텀 render 함수 - ErrorProvider를 기본으로 포함
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options: RenderOptions & {
    additionalProviders?: React.ComponentType<{ children: ReactNode }>[];
  } = {}
) => {
  const { additionalProviders = [], ...renderOptions } = options;
  const Wrapper = createTestWrapper(additionalProviders);

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * 시간 관련 테스트 유틸리티
 */
export const timeUtils = {
  /**
   * 비동기 작업을 위한 대기
   */
  wait: (ms: number = 0): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * useEffect 등의 비동기 업데이트를 기다림
   */
  waitForAsyncUpdate: (): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, 0)),
};

/**
 * 에러 메시지 매처
 */
export const errorMatchers = {
  hasErrorWithMessage: (
    errors: { message: string }[],
    message: string
  ): boolean => errors.some((error) => error.message === message),

  hasErrorWithCode: (errors: { code?: string }[], code: string): boolean =>
    errors.some((error) => error.code === code),
};

describe("testUtils", () => {
  it("테스트 유틸리티 파일이 정상적으로 로드되어야 한다", () => {
    expect(true).toBe(true);
  });
});
