// 로컬 스토리지 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  SUBSCRIBED_SYMBOLS: "subscribed_symbols",
  LOGIN_SUCCESS: "loginSuccess",
};

// OAuth 설정
export const AUTH = {
  GOOGLE: {
    CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  },
};
