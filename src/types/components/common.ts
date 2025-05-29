export interface LoadingIndicatorProps {
  message?: string;
}

export interface ErrorDisplayProps {
  error: string;
  title?: string;
  onRetry?: () => void;
}

export interface NavigationProps {
  className?: string;
}

export interface NavItem {
  href: string;
  label: string;
}
