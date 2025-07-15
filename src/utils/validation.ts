// 주식 코드 검증 (6자리 숫자)
export const isValidStockCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

// 숫자 문자열인지 검증
export const isNumericString = (value: string): boolean => {
  return value !== "" && !isNaN(Number(value));
};

// 양수인지 검증
export const isPositiveNumber = (value: string | number): boolean => {
  const num = typeof value === "string" ? Number(value) : value;
  return !isNaN(num) && num > 0;
};

// 양의 정수인지 검증 (주식 수량용)
export const isPositiveInteger = (value: string | number): boolean => {
  const num = typeof value === "string" ? Number(value) : value;
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// 주식 수량 검증 (문자열 입력 전용)
export const isValidStockQuantity = (quantity: string): boolean => {
  if (!quantity || quantity.trim() === "") return false;

  const num = Number(quantity);

  // NaN, Infinity 체크
  if (!Number.isFinite(num)) return false;

  // 양의 정수 체크
  return num > 0 && Number.isInteger(num);
};
