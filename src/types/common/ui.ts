import { ReactNode, MouseEvent, ChangeEvent } from "react";

// 로딩 관련 Props
export interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export interface ErrorDisplayProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

// 기본 컴포넌트 Props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// 이벤트 핸들러들
export type ClickHandler = (event: MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;
export type ValueChangeHandler<T = string> = (value: T) => void;

// 차트 데이터
export interface PriceDataPoint {
  time: string;
  price: number;
  volume?: number;
}

// 테이블 컬럼
export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex: keyof T;
  width?: string | number;
  render?: (value: T[keyof T], record: T) => ReactNode;
}

export interface NavigationProps {
  className?: string;
}

export interface NavItem {
  href: string;
  label: string;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  redirectPath?: string;
  loadingMessage?: string;
}

export interface MarketClosedNoticeProps {
  statusIcon: string;
  title: string;
  statusText: string;
  description: string;
  nextOpenTime?: string;
  nextOpenLabel?: string;
}

export interface NavigationProps {
  className?: string;
}

export interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}
