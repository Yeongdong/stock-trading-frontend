export interface AppError {
  id: string;
  message: string;
  code?: string;
  severity: "info" | "warning" | "error";
  timestamp: Date;
}

export interface ErrorItemProps {
  error: AppError;
  onDismiss: (id: string) => void;
}

export interface ErrorState {
  errors: AppError[];
}

export type ErrorAction =
  | { type: "ADD_ERROR"; payload: Omit<AppError, "id" | "timestamp"> }
  | { type: "REMOVE_ERROR"; payload: string }
  | { type: "CLEAR_ERRORS" };

export interface ErrorContextType {
  errors: AppError[];
  addError: (error: Omit<AppError, "id" | "timestamp">) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}
