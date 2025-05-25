import { API } from "@/constants";

class CsrfService {
  private tokenCache: string | null = null;
  private fetchPromise: Promise<string> | null = null;

  async fetchCsrfToken(): Promise<string> {
    try {
      const response = await fetch(`${API.SECURITY.CSRF_TOKEN}`, {
        method: "GET",
        credentials: "include",
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`CSRF 토큰 가져오기 실패: ${response.status}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("CSRF 토큰 가져오기 오류:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요."
        );
      }

      throw error;
    }
  }

  async getCsrfToken(): Promise<string> {
    // 캐시된 토큰이 있으면 반환
    if (this.tokenCache) {
      return this.tokenCache;
    }

    // 이미 요청 중인 경우 같은 Promise 반환
    if (this.fetchPromise) {
      return this.fetchPromise;
    }
    // 새로운 토큰 요청
    this.fetchPromise = this.fetchCsrfToken()
      .then((token) => {
        this.tokenCache = token;
        sessionStorage.setItem("csrf-token", token);
        return token;
      })
      .catch((error) => {
        // 에러 발생 시 캐시 초기화
        this.tokenCache = null;
        this.fetchPromise = null;
        throw error;
      })
      .finally(() => {
        // 요청 완료 후 Promise 초기화
        this.fetchPromise = null;
      });

    return this.fetchPromise;
  }

  // 토큰 캐시 초기화 (로그아웃 시 사용)
  clearToken(): void {
    this.tokenCache = null;
    this.fetchPromise = null;
    sessionStorage.removeItem("csrf-token");
  }

  // 세션 스토리지에서 토큰 로드 시도
  loadTokenFromStorage(): string | null {
    try {
      const token = sessionStorage.getItem("csrf-token");
      if (token) {
        this.tokenCache = token;
        return token;
      }
    } catch (error) {
      console.warn("세션 스토리지에서 CSRF 토큰 로드 실패:", error);
    }
    return null;
  }
}

export const csrfService = new CsrfService();
