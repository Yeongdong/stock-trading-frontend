export const formatKRW = (value: string) => {
  const numValue = parseInt(value, 10);
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(numValue);
};
