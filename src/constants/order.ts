export interface OrderTypeOption {
  value: string;
  label: string;
  requiresPrice: boolean;
}

export const ORDER_TYPES: OrderTypeOption[] = [
  { value: "00", label: "지정가", requiresPrice: true },
  { value: "01", label: "시장가", requiresPrice: false },
  { value: "02", label: "조건부지정가", requiresPrice: true },
  { value: "03", label: "최유리지정가", requiresPrice: false },
  { value: "04", label: "최우선지정가", requiresPrice: false },
  { value: "05", label: "장전 시간외 (08:20~08:40)", requiresPrice: true },
  { value: "06", label: "장후 시간외 (15:30~16:00)", requiresPrice: true },
  { value: "07", label: "시간외 단일가(16:00~18:00)", requiresPrice: true },
  { value: "11", label: "IOC지정가 (즉시체결,잔량취소)", requiresPrice: true },
  { value: "12", label: "FOK지정가 (즉시체결,전량취소)", requiresPrice: true },
  { value: "13", label: "IOC시장가 (즉시체결,잔량취소)", requiresPrice: false },
  { value: "14", label: "FOK시장가 (즉시체결,전량취소)", requiresPrice: false },
  { value: "15", label: "IOC최유리 (즉시체결,잔량취소)", requiresPrice: false },
  { value: "16", label: "FOK최유리 (즉시체결,전량취소)", requiresPrice: false },
];
