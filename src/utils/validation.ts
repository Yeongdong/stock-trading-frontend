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
