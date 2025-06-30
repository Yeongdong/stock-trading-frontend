/**
 * KIS API 기반 해외주식 검색 타입
 */
export interface ForeignStockSearchRequest {
  market: string; // nasdaq, nyse, tokyo, hongkong 등
  query: string; // 검색어 (종목명 또는 심볼)
  limit?: number; // 조회 결과 제한 수 (기본값: 50)
}

export interface ForeignStockInfo {
  symbol: string; // 종목코드
  displaySymbol: string; // 실시간조회심볼
  description: string; // 종목명 (한글)
  englishName: string; // 영문 종목명
  type: string; // 종목 타입 (Common Stock)
  currency: string; // 통화 코드 (USD, JPY, HKD 등)
  exchange: string; // 거래소 코드 (NAS, NYS, TSE 등)
  country: string; // 국가 코드 (US, JP, HK 등)

  // 가격 정보
  currentPrice: number; // 현재가
  changeRate: number; // 등락율 (%)
  changeAmount: number; // 대비 (전일 대비 변동값)
  changeSign: string; // 등락 기호 (1: 상한, 2: 상승, 3: 보합, 4: 하한, 5: 하락)

  // 거래 정보
  volume: number; // 거래량
  marketCap: number; // 시가총액 (천 단위)
  per?: number; // PER
  eps?: number; // EPS
  isTradable: boolean; // 매매가능 여부
  rank: number; // 순위 (거래량 기준)
}

export interface ForeignStockSearchResult {
  stocks: ForeignStockInfo[];
  count: number; // 총 검색 결과 수
  market: string; // 검색된 시장
  status: string; // 시세 상태 정보
}
