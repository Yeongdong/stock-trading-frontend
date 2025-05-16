"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { AppError, ErrorAction, ErrorState } from "@/types";

const initialState: ErrorState = {
  errors: [],
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case "ADD_ERROR":
      const newError: AppError = {
        ...action.payload,
        id: generateId(),
        timestamp: new Date(),
      };
      return {
        ...state,
        errors: [...state.errors, newError],
      };
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

const generateId = (): string => Math.random().toString(36).substring(2, 9);

interface ErrorContextType {
  errors: AppError[];
  addError: (error: Omit<AppError, "id" | "timestamp">) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = (error: Omit<AppError, "id" | "timestamp">) => {
    dispatch({ type: "ADD_ERROR", payload: error });
    console.error("Error occurred:", error);
  };

  const removeError = (id: string) => {
    dispatch({ type: "REMOVE_ERROR", payload: id });
  };

  const clearErrors = () => {
    dispatch({ type: "CLEAR_ERRORS" });
  };

  const value = {
    errors: state.errors,
    addError,
    removeError,
    clearErrors,
  };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
