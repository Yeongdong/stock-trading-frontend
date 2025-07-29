# 📈 실시간 주식 트레이딩 시스템 - 프론트엔드

> 한국투자증권 OpenAPI 연동 실시간 주식 거래 웹 애플리케이션

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)

## 🎯 프로젝트 개요

**실시간 주식 트레이딩 시스템 프론트엔드**는 한국투자증권 OpenAPI와 연동된 백엔드 서버와 통신하여 실시간 주가 모니터링, 주식 주문, 계좌 잔고 조회 등의 기능을 제공하는 웹 애플리케이션입니다.

### 주요 특징

- **실시간 주가 모니터링**: SignalR을 통한 실시간 데이터 수신
- **타입 안전성**: TypeScript로 컴파일 타임 에러 방지
- **모던 웹 기술**: Next.js 15 App Router 활용
- **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험

## 🛠 기술 스택

| 분류            | 기술                       | 버전   | 용도             |
| --------------- | -------------------------- | ------ | ---------------- |
| **Framework**   | Next.js                    | 15.1.0 | React 프레임워크 |
| **Language**    | TypeScript                 | 5.8.3  | 프로그래밍 언어  |
| **State**       | React Context              | -      | 상태 관리        |
| **Real-time**   | @microsoft/signalr         | -      | 실시간 통신      |
| **Styling**     | CSS Modules + Tailwind CSS | -      | 스타일링         |
| **HTTP Client** | Axios                      | -      | API 통신         |

## 📁 프로젝트 구조

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # 인증 관련 라우트 그룹
│   ├── admin/                  # 관리자 페이지
│   ├── api/                    # API 라우트 핸들러
│   ├── globals.css             # 글로벌 스타일
│   ├── layout.tsx              # 루트 레이아웃
│   └── page.tsx                # 홈 페이지
│
├── components/                 # 재사용 가능한 컴포넌트
│   ├── features/               # 기능별 컴포넌트
│   │   ├── account/            # 계정 관리
│   │   ├── auth/               # 인증 관련
│   │   ├── balance/            # 잔고 조회
│   │   ├── dashboard/          # 대시보드
│   │   ├── realtime/           # 실시간 데이터
│   │   ├── stock/              # 주식 정보
│   │   └── trading/            # 거래 관련
│   ├── layout/                 # 레이아웃 컴포넌트
│   └── ui/                     # 공통 UI 컴포넌트
│
├── contexts/                   # React Context
│   ├── AuthContext.tsx         # 인증 상태 관리
│   └── RealtimeContext.tsx     # 실시간 데이터 관리
│
├── hooks/                      # 커스텀 훅
│   ├── auth/                   # 인증 관련 훅
│   ├── market/                 # 시장 데이터 훅
│   └── trading/                # 거래 관련 훅
│
├── services/                   # 외부 서비스 연동
│   ├── api/                    # API 클라이언트
│   │   ├── auth/               # 인증 API
│   │   ├── common/             # 공통 API 설정
│   │   ├── market/             # 시장 데이터 API
│   │   ├── trading/            # 거래 API
│   │   └── user/               # 사용자 API
│   ├── chart/                  # 차트 관리
│   └── realtime/               # SignalR 실시간 서비스
│
├── styles/                     # 스타일 파일
│   ├── components/             # 컴포넌트별 스타일
│   ├── layout/                 # 레이아웃 스타일
│   └── globals.css             # 글로벌 CSS 변수
│
├── types/                      # TypeScript 타입 정의
│   ├── common/                 # 공통 타입
│   │   ├── api.ts              # API 관련 타입
│   │   ├── error.ts            # 에러 타입
│   │   └── ui.ts               # UI 관련 타입
│   └── domains/                # 도메인별 타입
│       ├── auth.ts             # 인증 타입
│       ├── market.ts           # 시장 데이터 타입
│       ├── realtime.ts         # 실시간 데이터 타입
│       └── trading.ts          # 거래 타입
│
├── constants/                  # 상수 정의
│   ├── api.ts                  # API 관련 상수
│   ├── errors.ts               # 에러 메시지 상수
│   └── ui.ts                   # UI 관련 상수
│
└── utils/                      # 유틸리티 함수
    ├── api.ts                  # API 헬퍼 함수
    ├── date.ts                 # 날짜 처리 함수
    └── format.ts               # 포맷팅 함수
```

## 🚀 주요 기능

### 실시간 주식 거래

- **주식 검색**: 국내/해외 주식 종목 검색
- **실시간 시세**: SignalR을 통한 실시간 주가 업데이트
- **주문 처리**: 매수/매도 주문 생성 및 관리
- **잔고 조회**: 계좌 잔고 및 보유 종목 실시간 조회
- **매수가능금액 조회**: 주문 전 매수 가능 금액 확인

### 사용자 경험

- **Google OAuth 인증**: 간편한 소셜 로그인
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **실시간 연결 상태**: 네트워크 연결 상태 모니터링
- **로딩 상태 관리**: 사용자 친화적인 로딩 인디케이터

## ⚡ 핵심 기술 구현

### 1. SignalR 실시간 통신

SignalR을 활용한 실시간 데이터 수신 및 자동 재연결 구현

```typescript
// src/services/realtime/realtimeSocketService.ts
export class RealtimeSocketService {
  private hubConnection: signalR.HubConnection | null = null;

  constructor(
    private readonly hubUrl: string = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL ||
      "https://localhost:7072/stockhub"
  ) {}

  public async start(): Promise<boolean> {
    try {
      // JWT 토큰 확인
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        return false;
      }

      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => tokenStorage.getAccessToken() || "",
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .build();

      await this.hubConnection.start();
      return true;
    } catch (error) {
      console.error("SignalR 연결 실패:", error);
      return false;
    }
  }
}
```

### 2. API 클라이언트 구현

타입 안전한 API 클라이언트와 에러 처리

```typescript
// src/services/api/common/apiClient.ts
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiOptions {
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  priority?: RequestPriority;
}

export class ApiClient {
  private readonly baseURL: string;
  private readonly timeout: number = 10000;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get<T>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>("GET", url, undefined, options);
  }

  async post<T>(
    url: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", url, data, options);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      // 인증 토큰 추가
      if (options.requiresAuth) {
        const token = tokenStorage.getAccessToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json();

      return {
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "알 수 없는 오류",
        status: 500,
      };
    }
  }
}
```

### 3. 타입 안전한 상태 관리

React Context를 활용한 전역 상태 관리

```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, provider: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, provider: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, provider });
      if (response.data) {
        setUser(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    tokenStorage.clearTokens();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 4. 커스텀 훅 활용

재사용 가능한 비즈니스 로직 훅

```typescript
// src/hooks/trading/useTradingBalance.ts
export function useTradingBalance() {
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tradingApi.getBalance();
      if (response.data) {
        setBalance(response.data);
      } else {
        setError(response.error || "잔고 조회에 실패했습니다.");
      }
    } catch (err) {
      setError("잔고 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
```

## 🧪 테스트 구성

### 컴포넌트 테스트 예시

```typescript
// src/components/features/auth/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "../LoginForm";

describe("LoginForm", () => {
  it("로그인 폼이 올바르게 렌더링된다", () => {
    render(<LoginForm />);

    expect(screen.getByText("Google로 로그인")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("Google 로그인 버튼 클릭시 로그인 함수가 호출된다", async () => {
    const mockLogin = jest.fn();
    render(<LoginForm onLogin={mockLogin} />);

    fireEvent.click(screen.getByText("Google로 로그인"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("google");
    });
  });
});
```

### 🧪 테스트 커버리지

> **전체 커버리지: 92.24%** - 높은 품질의 코드와 안정성을 보장하는 포괄적인 테스트 환경

#### 📊 모듈별 커버리지 현황

| 모듈             | Statements | Branches | Functions | Lines   |
| ---------------- | ---------- | -------- | --------- | ------- |
| **Stock Chart**  | 99.01%     | 97.43%   | 100%      | 98.92%  |
| **Stock Hooks**  | 94.5%      | 83.83%   | 97.67%    | 94.39%  |
| **API Services** | 87-100%    | 78-88%   | 80-100%   | 90-100% |
| **Utilities**    | 94.32%     | 85.34%   | 96.77%    | 96.18%  |
| **Contexts**     | 83.83%     | 64.4%    | 94.28%    | 83.04%  |
| **Constants**    | 76%        | 75%      | 33.33%    | 76%     |

---

## 📞 문의사항

**개발자**: 정영동  
**이메일**: jyd37855@gmail.com  
**GitHub**: [@Yeongdong](https://github.com/Yeongdong)
