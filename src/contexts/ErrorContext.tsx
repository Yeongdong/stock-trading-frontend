"use client";

import { AppError, ErrorAction, ErrorContextType, ErrorState } from "@/types";
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";

const initialState: ErrorState = {
  errors: [],
};

const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
};

const isDuplicateError = (
  errors: readonly AppError[],
  newError: Omit<AppError, "id" | "timestamp">
): boolean => {
  const now = Date.now();
  const fiveSecondsAgo = now - 5000; // 5초 내 중복 체크

  return errors.some(
    (error) =>
      error.message === newError.message &&
      error.code === newError.code &&
      error.severity === newError.severity &&
      error.timestamp.getTime() > fiveSecondsAgo
  );
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case "ADD_ERROR": {
      if (isDuplicateError(state.errors, action.payload)) return state;

      const newError: AppError = {
        ...action.payload,
        id: generateId(),
        timestamp: new Date(),
      };

      // 최대 10개까지만 유지 (메모리 관리)
      const updatedErrors = [...state.errors, newError].slice(-10);

      return {
        ...state,
        errors: updatedErrors,
      };
    }

    case "REMOVE_ERROR":
      return {
        ...state,
        errors: state.errors.filter((error) => error.id !== action.payload),
      };

    case "CLEAR_ERRORS":
      return {
        ...state,
        errors: [],
      };

    default:
      return state;
  }
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = useCallback((error: Omit<AppError, "id" | "timestamp">) => {
    if (process.env.NODE_ENV === "development")
      console.error("Error occurred:", error);

    dispatch({ type: "ADD_ERROR", payload: error });
  }, []);

  const removeError = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ERROR", payload: id });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: "CLEAR_ERRORS" });
  }, []);

  const value = useMemo(
    () => ({
      errors: state.errors,
      addError,
      removeError,
      clearErrors,
    }),
    [state.errors, addError, removeError, clearErrors]
  );

  // 자동 에러 제거 (10초 후)
  useEffect(() => {
    if (state.errors.length === 0) return;

    const now = Date.now();
    const oldErrors = state.errors.filter(
      (error) => now - error.timestamp.getTime() > 10000 // 10초
    );

    if (oldErrors.length > 0) {
      const timer = setTimeout(() => {
        oldErrors.forEach((error) => {
          dispatch({ type: "REMOVE_ERROR", payload: error.id });
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.errors]);

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined)
    throw new Error("useError must be used within an ErrorProvider");

  return context;
};
