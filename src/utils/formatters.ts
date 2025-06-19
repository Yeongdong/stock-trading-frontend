// 숫자를 한국 원화로 포맷팅
export const formatKRW = (value: string | number): string => {
  const numValue =
    typeof value === "string"
      ? value === "" || isNaN(Number(value))
        ? 0
        : Number(value)
      : value;

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(numValue);
};

// 숫자를 천단위 콤마로 포맷팅
export const formatNumber = (value: string | number): string => {
  const numValue =
    typeof value === "string"
      ? value === "" || isNaN(Number(value))
        ? 0
        : Number(value)
      : value;

  return new Intl.NumberFormat("ko-KR").format(numValue);
};

// 퍼센트 포맷팅 (+ 부호 포함)
export const formatPercent = (
  value: number,
  decimalPlaces: number = 1
): string => {
  const formatted = value.toFixed(decimalPlaces);
  return value > 0 ? `+${formatted}%` : `${formatted}%`;
};
