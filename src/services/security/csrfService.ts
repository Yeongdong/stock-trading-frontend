import { API } from "@/constants";

export const csrfService = {
  async fetchCsrfToken(): Promise<string> {
    try {
      const response = await fetch(`${API.SECURITY.CSRF_TOKEN}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("CSRF 토큰 가져오기 실패");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("CSRF 토큰 가져오기 오류:", error);
      throw error;
    }
  },

  async getCsrfToken(): Promise<string> {
    const storedToken = sessionStorage.getItem("csrf-token");

    if (storedToken) {
      return storedToken;
    }

    const token = await this.fetchCsrfToken();
    sessionStorage.setItem("csrf-token", token);
    return token;
  },
};
