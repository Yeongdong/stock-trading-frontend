/**
 * 통화별 포맷팅 함수
 */
export const formatCurrency = (
  value: string | number,
  currency: string = "KRW"
): string => {
  const numValue =
    typeof value === "string"
      ? value === "" || isNaN(Number(value))
        ? 0
        : Number(value)
      : value;

  // 통화별 locale 설정
  const localeMap: Record<string, string> = {
    KRW: "ko-KR",
    USD: "en-US",
    JPY: "ja-JP",
    GBP: "en-GB",
    HKD: "zh-HK",
  };

  const locale = localeMap[currency] || "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(numValue);
};

/**
 * 숫자를 한국 원화로 포맷팅
 */
export const formatKRW = (value: string | number): string => {
  return formatCurrency(value, "KRW");
};

/**
 * 숫자를 천단위 콤마로 포맷팅
 */
export const formatNumber = (value: string | number): string => {
  const numValue =
    typeof value === "string"
      ? value === "" || isNaN(Number(value))
        ? 0
        : Number(value)
      : value;

  return new Intl.NumberFormat("ko-KR").format(numValue);
};

/**
 * 퍼센트 포맷팅 (+ 부호 포함)
 */
export const formatPercent = (
  value: number,
  decimalPlaces: number = 1
): string => {
  const formatted = value.toFixed(decimalPlaces);
  return value > 0 ? `+${formatted}%` : `${formatted}%`;
};

/**
 * 환율 포맷팅
 */
export const formatExchangeRate = (
  rate: string | number,
  fromCurrency: string,
  toCurrency: string = "KRW"
): string => {
  const numRate =
    typeof rate === "string"
      ? rate === "" || isNaN(Number(rate))
        ? 0
        : Number(rate)
      : rate;

  return `1 ${fromCurrency} = ${formatNumber(numRate)} ${toCurrency}`;
};

/**
 * 거래소 코드를 한국어 이름으로 변환
 */
export const formatExchangeName = (exchangeCode: string): string => {
  const exchangeNames: Record<string, string> = {
    NASD: "나스닥",
    NYSE: "뉴욕증권거래소",
    AMEX: "아멕스",
    TKSE: "도쿄증권거래소",
    LNSE: "런던증권거래소",
    HKEX: "홍콩증권거래소",
    TSE: "도쿄증권거래소",
    LSE: "런던증권거래소",
  };

  return exchangeNames[exchangeCode] || exchangeCode;
};
