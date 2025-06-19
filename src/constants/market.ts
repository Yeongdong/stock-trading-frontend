// 시장 운영 시간 설정
export const MARKET_HOURS = {
  OPEN: 9, // 오전 9시
  CLOSE: 15, // 오후 3시
  CLOSE_MINUTE: 30, // 30분 (15:30)
} as const;

// 시장 상태 메시지
export const MARKET_STATUS = {
  CLOSED_WEEKEND: { text: "휴장", icon: "🏢" },
  OPEN: { text: "장중", icon: "📈" },
  PRE_MARKET: { text: "장전", icon: "⏰" },
  POST_MARKET: { text: "장후", icon: "🌙" },
} as const;
