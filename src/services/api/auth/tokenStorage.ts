import { TokenData } from "@/types";

class TokenStorage {
  private token: TokenData | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  setAccessToken(accessToken: string, expiresIn: number): void {
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

    const oneMinuteFromNow = Date.now() + 60 * 1000; // 1분
    return this.token.expiresAt <= oneMinuteFromNow;
  }

  private scheduleRefresh(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    if (!this.token) return;

    const refreshTime = this.token.expiresAt - Date.now() - 60 * 1000; // 1분 전

    if (refreshTime > 0)
      this.refreshTimer = setTimeout(() => {
        this.handleSilentRefresh();
      }, refreshTime);
  }

  private async handleSilentRefresh(): Promise<void> {
    // Dynamic import로 순환 참조 방지
    const { authService } = await import("@/services/api/auth/authService");
    await authService.silentRefresh();
  }
}

export const tokenStorage = new TokenStorage();
