export interface LoadingIndicatorProps {
  message?: string;
}

export interface ErrorDisplayProps {
  error: string;
  title?: string;
  onRetry?: () => void;
}
