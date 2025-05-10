export const formatKRW = (value: string) => {
  const numValue =
    value === "" || isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(numValue);
};
