"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AppError, ErrorContextType } from "@/types/contexts/error";

// 초기 컨텍스트 값 설정
const initialContext: ErrorContextType = {
  errors: [],
  addError: () => {},
  removeError: () => {},
  clearErrors: () => {},
};

// 컨텍스트 생성
const ErrorContext = createContext<ErrorContextType>(initialContext);

// 고유 ID 생성 함수
const generateId = (): string => Math.random().toString(36).substring(2, 9);

// 컨텍스트 Provider 컴포넌트
export const ErrorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  // 오류 추가 함수
  const addError = useCallback((error: Omit<AppError, "id" | "timestamp">) => {
    const newError: AppError = {
      ...error,
      id: generateId(),
      timestamp: new Date(),
    };
    setErrors((prevErrors) => [...prevErrors, newError]);

    console.error("Error occurred:", newError);
  }, []);

  // 특정 오류 제거 함수
  const removeError = useCallback((id: string) => {
    setErrors((prevErrors) => prevErrors.filter((error) => error.id !== id));
  }, []);

  // 모든 오류 제거 함수
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return (
    <ErrorContext.Provider
      value={{ errors, addError, removeError, clearErrors }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

// 커스텀 훅 생성
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
