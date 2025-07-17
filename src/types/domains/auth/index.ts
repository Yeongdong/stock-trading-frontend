/**
 * 인증 관련 타입 정의
 */

/**
 * 토큰 갱신 응답 타입
 */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * 인증 초기화 결과 타입
 */
export interface AuthInitResult {
  success: boolean;
  needsLogin: boolean;
}

/**
 * 토큰 데이터 구조
 */
export interface TokenData {
  accessToken: string;
  expiresAt: number;
}
