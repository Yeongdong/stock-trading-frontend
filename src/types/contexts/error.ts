export interface AppError {
  id: string;
  message: string;
  code?: string;
  severity: "info" | "warning" | "error";
  timestamp: Date;
}

export interface ErrorContextType {
  errors: AppError[];
  addError: (error: Omit<AppError, "id" | "timestamp">) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export interface ErrorItemProps {
  error: AppError;
  onDismiss: (id: string) => void;
}
