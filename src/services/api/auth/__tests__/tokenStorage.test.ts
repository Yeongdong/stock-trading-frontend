import { tokenStorage } from "../tokenStorage";

const mockSilentRefresh = jest.fn();

jest.mock("@/services/api/auth/authService", () => ({
  authService: {
    silentRefresh: mockSilentRefresh,
  },
}));

describe("TokenStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    tokenStorage.clearAccessToken();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("setAccessToken", () => {
    it("토큰을 올바르게 저장한다", () => {
      tokenStorage.setAccessToken("test-token", 3600);

      expect(tokenStorage.getAccessToken()).toBe("test-token");
    });

    it("이전 토큰을 덮어쓴다", () => {
      tokenStorage.setAccessToken("old-token", 3600);
      tokenStorage.setAccessToken("new-token", 7200);

      expect(tokenStorage.getAccessToken()).toBe("new-token");
    });

    it("음수 expiresIn은 토큰을 저장하지 않는다", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      tokenStorage.setAccessToken("test-token", -100);

      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Invalid expiresIn: -100. Token will be immediately expired."
      );

      consoleSpy.mockRestore();
    });

    it("0 expiresIn은 토큰을 저장하지 않는다", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      tokenStorage.setAccessToken("test-token", 0);

      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Invalid expiresIn: 0. Token will be immediately expired."
      );

      consoleSpy.mockRestore();
    });

    it("토큰 설정 시 자동 갱신을 스케줄링한다", () => {
      const setSpy = jest.spyOn(global, "setTimeout");

      tokenStorage.setAccessToken("test-token", 3600);

      expect(setSpy).toHaveBeenCalled();
    });

    it("1초 expiresIn은 정상적으로 저장한다", () => {
      tokenStorage.setAccessToken("test-token", 1);

      expect(tokenStorage.getAccessToken()).toBe("test-token");
    });

    it("유효하지 않은 expiresIn일 때 스케줄링하지 않는다", () => {
      const setSpy = jest.spyOn(global, "setTimeout");

      tokenStorage.setAccessToken("test-token", 0);

      expect(setSpy).not.toHaveBeenCalled();
    });
  });

  describe("getAccessToken", () => {
    it("토큰이 없으면 null을 반환한다", () => {
      expect(tokenStorage.getAccessToken()).toBeNull();
    });

    it("유효한 토큰을 반환한다", () => {
      tokenStorage.setAccessToken("valid-token", 3600);

      expect(tokenStorage.getAccessToken()).toBe("valid-token");
    });

    it("만료된 토큰은 null을 반환하고 정리한다", () => {
      tokenStorage.setAccessToken("expired-token", 1); // 1초 후 만료

      // 2초 후로 시간 이동 (만료됨)
      jest.advanceTimersByTime(2000);

      expect(tokenStorage.getAccessToken()).toBeNull();
    });

    it("만료 시점 경계에서 올바르게 동작한다", () => {
      tokenStorage.setAccessToken("boundary-token", 1); // 1초

      // 999ms 후 (아직 만료 안됨)
      jest.advanceTimersByTime(999);
      expect(tokenStorage.getAccessToken()).toBe("boundary-token");

      // 1ms 더 (만료됨)
      jest.advanceTimersByTime(1);
      expect(tokenStorage.getAccessToken()).toBeNull();
    });
  });

  describe("clearAccessToken", () => {
    it("토큰을 완전히 정리한다", () => {
      tokenStorage.setAccessToken("test-token", 3600);
      expect(tokenStorage.getAccessToken()).toBe("test-token");

      tokenStorage.clearAccessToken();

      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(false);
    });

    it("스케줄된 타이머를 정리한다", () => {
      const clearSpy = jest.spyOn(global, "clearTimeout");

      tokenStorage.setAccessToken("test-token", 3600);
      tokenStorage.clearAccessToken();

      expect(clearSpy).toHaveBeenCalled();
    });

    it("토큰이 없는 상태에서 호출해도 오류가 발생하지 않는다", () => {
      expect(() => {
        tokenStorage.clearAccessToken();
      }).not.toThrow();
    });
  });

  describe("isAccessTokenExpiringSoon", () => {
    it("토큰이 없으면 false를 반환한다", () => {
      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(false);
    });

    it("만료까지 충분한 시간이 남으면 false를 반환한다", () => {
      tokenStorage.setAccessToken("test-token", 3600); // 1시간

      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(false);
    });

    it("1분 이내 만료 예정이면 true를 반환한다", () => {
      tokenStorage.setAccessToken("test-token", 30); // 30초

      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(true);
    });

    it("정확히 1분 남았을 때 true를 반환한다", () => {
      tokenStorage.setAccessToken("test-token", 120); // 2분

      // 1분 후 (정확히 1분 남음)
      jest.advanceTimersByTime(60000);

      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(true);
    });

    it("1분 1초 남았을 때 false를 반환한다", () => {
      tokenStorage.setAccessToken("test-token", 121); // 2분 1초

      // 1분 후 (1초 더 남음)
      jest.advanceTimersByTime(60000);

      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(false);
    });
  });

  describe("스케줄링 로직", () => {
    it("충분한 시간이 있으면 2분 전에 갱신을 스케줄한다", () => {
      const setSpy = jest.spyOn(global, "setTimeout");

      tokenStorage.setAccessToken("test-token", 300); // 5분

      // setTimeout이 호출되었는지 확인
      expect(setSpy).toHaveBeenCalled();

      // 호출된 시간이 대략 3분(180초)인지 확인 (5분 - 2분)
      const calledDelay = setSpy.mock.calls[0][1] as number;
      expect(calledDelay).toBeCloseTo(180000, -3); // 180초 ± 1초
    });

    it("2분 이내 만료 예정 토큰은 setTimeout을 호출하지 않는다", () => {
      const setSpy = jest.spyOn(global, "setTimeout");
      setSpy.mockClear(); // 이전 호출 기록 제거

      tokenStorage.setAccessToken("test-token", 100); // 100초 = 1분 40초

      // 즉시 갱신이므로 setTimeout은 호출되지 않아야 함
      expect(setSpy).not.toHaveBeenCalled();
    });

    it("토큰이 변경되면 이전 스케줄을 취소하고 새로 설정한다", () => {
      const clearSpy = jest.spyOn(global, "clearTimeout");
      const setSpy = jest.spyOn(global, "setTimeout");

      tokenStorage.setAccessToken("first-token", 300);
      tokenStorage.setAccessToken("second-token", 600);

      expect(clearSpy).toHaveBeenCalled();
      expect(setSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("에러 처리", () => {
    it("잘못된 expiresIn에 대해 경고를 로깅한다", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      tokenStorage.setAccessToken("test-token", -1);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Invalid expiresIn: -1. Token will be immediately expired."
      );
      expect(tokenStorage.getAccessToken()).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe("실제 시나리오", () => {
    it("토큰 설정부터 만료까지의 라이프사이클", () => {
      // 1. 토큰 설정
      tokenStorage.setAccessToken("lifecycle-token", 180); // 3분
      expect(tokenStorage.getAccessToken()).toBe("lifecycle-token");
      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(false);

      // 2. 1분 50초 후 (1분 10초 남음, 아직 안전)
      jest.advanceTimersByTime(110000);
      expect(tokenStorage.getAccessToken()).toBe("lifecycle-token");
      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(false);

      // 3. 2분 30초 후 (30초 남음, 만료 임박)
      jest.advanceTimersByTime(40000); // 추가 40초 (총 150초 경과)
      expect(tokenStorage.getAccessToken()).toBe("lifecycle-token");
      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(true);

      // 4. 3분 후 (만료됨)
      jest.advanceTimersByTime(30000);
      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(false);
    });

    it("토큰 만료 후 접근 시 자동 정리", () => {
      tokenStorage.setAccessToken("expiring-token", 1); // 1초

      // 만료 후
      jest.advanceTimersByTime(1001);

      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(tokenStorage.isAccessTokenExpiringSoon()).toBe(false);
    });

    it("서버에서 즉시 만료 토큰을 보낸 경우", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      // 로그아웃 응답에서 즉시 만료 토큰
      tokenStorage.setAccessToken("logout-token", 0);

      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Invalid expiresIn: 0. Token will be immediately expired."
      );

      consoleSpy.mockRestore();
    });
  });
});
