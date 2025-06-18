// 기본 타입들
export type StockCode = string;
export type Money = number;
export type Quantity = number;
export type Percentage = number;

// 날짜/시간
export type DateString = string; // YYYY-MM-DD
export type TimeString = string; // HH:mm:ss

// 주식 관련
export type PriceDirection = "up" | "down" | "unchanged";
export type OrderType = "market" | "limit";
export type OrderStatus = "pending" | "filled" | "cancelled";

// 기간 코드 (차트용)
export type PeriodCode = "D" | "W" | "M";
