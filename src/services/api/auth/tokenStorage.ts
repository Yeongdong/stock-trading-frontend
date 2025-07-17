import { TokenData } from "@/types/domains/auth";

class TokenStorage {
  private token: TokenData | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly REFRESH_BUFFER_TIME = 2 * 60 * 1000; // 2분 (만료 임박 판단보다 여유있게)
  private readonly EXPIRY_WARNING_TIME = 60 * 1000; // 1분

  setAccessToken(accessToken: string, expiresIn: number): void {
    // 음수나 0은 즉시 만료로 처리
    if (expiresIn <= 0) {
      console.warn(
        `Invalid expiresIn: ${expiresIn}. Token will be immediately expired.`
      );
      return; // 토큰을 저장하지 않음
    }

    const expiresAt = Date.now() + expiresIn * 1000;

    this.token = {
      accessToken,
      expiresAt,
    };

    this.scheduleRefresh();
  }

  getAccessToken(): string | null {
    if (!this.token) return null;

    // 만료된 토큰은 null 반환
    if (Date.now() >= this.token.expiresAt) {
      this.clearAccessToken();
      return null;
    }

    return this.token.accessToken;
  }

  clearAccessToken(): void {
    this.token = null;

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  isAccessTokenExpiringSoon(): boolean {
    if (!this.token) return false;

    const warningTime = Date.now() + this.EXPIRY_WARNING_TIME;
    return this.token.expiresAt <= warningTime;
  }

  private scheduleRefresh(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    if (!this.token) return;

    const refreshTime =
      this.token.expiresAt - Date.now() - this.REFRESH_BUFFER_TIME;

    // 갱신 시점이 너무 가까우면 즉시 갱신 시도
    if (refreshTime <= 0) {
      // 토큰이 유효하면 즉시 갱신 시도
      if (Date.now() < this.token.expiresAt) {
        this.handleSilentRefresh();
      }
      return;
    }

    this.refreshTimer = setTimeout(() => {
      this.handleSilentRefresh();
    }, refreshTime);
  }

  private async handleSilentRefresh(): Promise<void> {
    // 순환 참조 방지를 위한 dynamic import
    try {
      const { authService } = await import("@/services/api/auth/authService");
      await authService.silentRefresh();
    } catch (error) {
      console.error("Silent refresh failed:", error);
      // 갱신 실패 시 토큰을 정리하지 않음 (상위에서 처리)
    }
  }
}

export const tokenStorage = new TokenStorage();
