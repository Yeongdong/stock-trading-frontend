# 📈 Stock Trading Frontend – React TypeScript Project

## 🎯 프로젝트 개요

> 실제 증권사 API(한국투자증권 OpenAPI)와 연동하여 실시간 주가 모니터링, 주식 주문, 계좌 잔고 조회 등의 기능을 제공하는 **프론트엔드 트레이딩 시스템**입니다.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)

## 🛠 기술 스택

| 분류                   | 기술 스택                                | 설명                                                       |
| :--------------------- | :--------------------------------------- | :--------------------------------------------------------- |
| **Frontend**           | Next.js 15 (App Router) + TypeScript 5.8 | 최신 React 생태계와 타입 안전성을 통한 모던 웹 개발        |
| **State Management**   | React Context                            | 컴포넌트 간 효율적인 상태 공유 및 데이터 플로우 관리       |
| **Real-time**          | @microsoft/signalr                       | 서버-클라이언트 간 실시간 양방향 통신 및 자동 재연결       |
| **Data Visualization** | Recharts + Lightweight Charts            | 실시간 차트(Recharts) + 종목 시세 차트(Lightweight Charts) |
| **Styling**            | CSS Modules + Tailwind CSS               | 컴포넌트 스코프 스타일링과 유틸리티 우선 CSS 조합          |
| **UI Components**      | Radix UI + Lucide React + 자체 구현      | 접근성과 디자인 시스템을 고려한 UI 컴포넌트 조합           |
| **API Management**     | 직접 구현한 API 클라이언트 + Axios       | 금융 API Rate Limiting 문제 해결을 위한 커스텀 솔루션      |
| **Authentication**     | JWT + Google OAuth 2.0                   | 안전한 사용자 인증 및 토큰 자동 갱신 시스템                |
| **Testing**            | Jest + React Testing Library             | 컴포넌트/비즈니스 로직 단위 테스트 및 통합 테스트          |

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router (라우팅 레이어)
├── components/             # 컴포넌트 레이어
│   ├── features/           # 도메인별 비즈니스 컴포넌트
│   │   ├── account/        # 계정 관리 (KIS API 토큰 설정)
│   │   ├── auth/           # 인증/인가 플로우
│   │   ├── dashboard/      # 대시보드 메인 화면
│   │   ├── balance/        # 잔고 조회 관련
│   │   ├── realtime/       # 실시간 데이터 처리
│   │   ├── stock/          # 주식 거래 관련
│   │   └── trading/        # 주문 관련 컴포넌트
│   ├── layout/             # 레이아웃 컴포넌트
│   └── ui/                 # 순수 UI 컴포넌트 (디자인 시스템)
├── services/               # 외부 서비스 연동 레이어
│   ├── api/                # RESTful API 클라이언트
│   │   ├── auth/           # 인증 토큰 관리
│   │   ├── common/         # API 공통 로직 (우선순위, 큐잉)
│   │   ├── trading/        # 거래 API 서비스
│   │   └── user/           # 사용자 API 서비스
│   ├── chart/              # 차트 관리 서비스 (ChartManager)
│   └── realtime/           # SignalR 실시간 서비스
├── hooks/                  # 비즈니스 로직 커스텀 훅
├── contexts/               # React Context 상태 관리
├── types/                  # TypeScript 도메인 타입 정의
│   ├── common/             # 공통 타입 (API, UI, Error)
│   └── domains/            # 도메인별 타입 (주식, 실시간, 거래)
├── constants/              # 상수 정의 (API, UI, 에러 메시지)
├── styles/                 # 글로벌 스타일 (CSS Modules + Tailwind)
└── utils/                  # 유틸리티 함수 (데이터 처리, 캐시 등)
```

## 🚀 핵심 기능

### **실시간 주식 거래**

- `실시간 주가 차트`: Recharts를 활용한 실시간 라인 차트
- `종목 시세 차트`: Lightweight Charts로 구현한 캔들스틱 + 거래량 차트
- `주식 매수/매도`: 국내/해외 주식 주문 시스템 (즉시주문/예약주문)
- `매수가능금액 조회`: 주문 전 매수 가능 금액 확인 시스템
- `계좌 잔고 조회`: 실시간 자산 현황 및 보유 종목 모니터링
- `주문 체결 알림`: SignalR을 통한 실시간 체결 내역 알림

### **사용자 경험 최적화**

- `반응형 디자인`: 모든 디바이스 지원
- `오프라인 감지`: 네트워크 상태 변화 감지 및 사용자 알림
- `로딩 상태 관리`: Skeleton UI와 프로그레시브 로딩

## ⚡ 핵심 기술 구현

### **1. 실시간 데이터 처리 아키텍처**

**SignalR**을 활용하여 실시간 주가 데이터를 안정적으로 수신하고, **자동 재연결** 및 **지수 백오프** 알고리즘을 통해 네트워크 불안정 상황에서도 안정적인 서비스 제공

```typescript
// SignalR 자동 재연결 + 지수 백오프 구현
export class RealtimeSocketService {
  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(process.env.NEXT_PUBLIC_SIGNALR_HUB_URL)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // 2초 → 4초 → 8초 → 16초 → 32초 (최대)
          return Math.min(
            2000 * Math.pow(2, retryContext.previousRetryCount),
            32000
          );
        },
      })
      .build();
  }
}
```

### **2. API 요청 우선순위 관리 시스템**

한국투자증권 API의 **초당 호출 제한(Rate Limiting)** 문제를 해결하기 위해 **우선순위 기반 요청 큐**를 직접 설계 후 구현

```typescript
// 우선순위 기반 API 요청 큐 구현
class RequestQueue {
  private readonly MIN_INTERVAL = 500; // 초당 2회 제한

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        await this.waitForMinInterval(); // Rate Limiting 준수
        const result = await request();
        resolve(result);
      });
      this.processQueue();
    });
  }
}

// API 우선순위 규칙 정의
const API_PRIORITY_RULES = [
  {
    pattern: /\/api\/trading\/order$/,
    priority: RequestPriority.CRITICAL, // 주문 요청 최우선
  },
  {
    pattern: /\/api\/trading\/balance/,
    priority: RequestPriority.HIGH, // 잔고 조회
  },
];
```

### **3. 타입 안전한 도메인 모델링**

복잡한 금융 도메인 모델의 **불변성**과 **타입 안전성**을 컴파일 타임에 확보

```typescript
// 불변성을 보장하는 도메인 타입 정의
export interface RealtimeStockData {
  readonly symbol: StockCode;
  readonly currentPrice: number;
  readonly priceChange: number;
  readonly volume: number;
  readonly timestamp: Date;
}

// Union 타입으로 명확한 상태 변화 정의
export type RealtimeAction =
  | {
      type: "UPDATE_STOCK_DATA";
      payload: { symbol: StockCode; data: RealtimeStockData };
    }
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };
```

## 🎯 기술적 도전과 해결 과정

### **도전 1: 실시간 데이터 렌더링 성능 최적화**

**문제**: 초당 50회 이상의 주가 데이터 업데이트로 인한 UI 버벅임  
**해결**: Throttling(100ms) + React.memo + Context 분리로 **렌더링 횟수 80% 감소**

### **도전 2: 한국투자증권 API Rate Limiting**

**문제**: 초당 5회 호출 제한으로 인한 API 요청 실패율 12%  
**해결**: 우선순위 기반 요청 큐 시스템 자체 구현으로 **요청 실패율 96% 감소**

## 📊 성능 최적화 결과

| 메트릭                    | Before    | After     | 개선율    |
| ------------------------- | --------- | --------- | --------- |
| 초기 로딩 시간            | 3.2s      | 1.1s      | **66% ↓** |
| 실시간 데이터 렌더링 횟수 | 초당 50회 | 초당 10회 | **80% ↓** |
| API 요청 실패율           | 12%       | 0.5%      | **96% ↓** |
| 번들 크기 (gzipped)       | 380KB     | 245KB     | **35% ↓** |

## 💡 핵심 학습 성과

### **실시간 시스템 아키텍처**

- SignalR을 활용한 WebSocket 기반 실시간 통신 기술 완전 습득
- 자동 재연결 및 연결 상태 관리 메커니즘 구현으로 안정성 확보

### **문제 해결 능력**

- 외부 API 제약사항(Rate Limiting)을 창의적으로 해결하는 엔지니어링 사고
- 실시간 데이터 처리 시 발생하는 성능 병목 지점 식별 및 해결

### **타입 주도 개발**

- TypeScript 고급 타입 기능(Union, Generic, Conditional Types) 활용
- 도메인 모델링을 통한 비즈니스 로직의 타입 안전성 확보

## 🧪 테스트 커버리지

> **전체 커버리지: 92.24%** - 높은 품질의 코드와 안정성을 보장하는 포괄적인 테스트 환경

![Test Coverage](https://img.shields.io/badge/Coverage-92.24%25-brightgreen?style=flat&logo=jest)
![Statements](https://img.shields.io/badge/Statements-92.24%25-brightgreen)
![Branches](https://img.shields.io/badge/Branches-82.35%25-green)
![Functions](https://img.shields.io/badge/Functions-92.57%25-brightgreen)
![Lines](https://img.shields.io/badge/Lines-92.95%25-brightgreen)

### 📊 모듈별 커버리지 현황

| 모듈             | Statements | Branches | Functions | Lines   |
| ---------------- | ---------- | -------- | --------- | ------- |
| **Stock Chart**  | 99.01%     | 97.43%   | 100%      | 98.92%  |
| **Stock Hooks**  | 94.5%      | 83.83%   | 97.67%    | 94.39%  |
| **API Services** | 87-100%    | 78-88%   | 80-100%   | 90-100% |
| **Utilities**    | 94.32%     | 85.34%   | 96.77%    | 96.18%  |
| **Contexts**     | 83.83%     | 64.4%    | 94.28%    | 83.04%  |
| **Constants**    | 76%        | 75%      | 33.33%    | 76%     |

### 🎯 핵심 성과

#### ✅ 높은 커버리지 달성 영역

- **주식 차트 모델** (`PeriodPriceChartModel.ts`): 99.01% 커버리지
- **Stock Hooks**: 평균 94.5% 커버리지로 비즈니스 로직 안정성 확보
- **캐시 매니저** (`LayeredCacheManager.ts`): 92.3% 커버리지
- **데이터 처리** (`dataProcessor.ts`): 96.61% 커버리지

### 📈 테스트 전략

#### **Unit Tests**

- **React Hooks**: 커스텀 훅의 상태 관리 및 부수 효과 검증
- **Utility Functions**: 데이터 변환, 검증, 포맷팅 로직 테스트
- **API Services**: 외부 API 통신 로직 및 에러 처리 검증

#### **Integration Tests**

- **Context Providers**: 여러 컴포넌트 간 상태 공유 검증
- **Cache Manager**: 다층 캐시 시스템의 정합성 검증
- **Error Handling**: 전역 에러 처리 플로우 검증

#### **Test Utilities**

- **Custom Render**: Provider 조합을 통한 컴포넌트 테스트 환경 구성
- **Mock Data**: 실제 API 응답과 유사한 테스트 데이터 제공
- **Time Utils**: 비동기 작업 및 타이머 관련 테스트 지원

---

> 💡 **테스트 품질 관리**: 새로운 기능 추가 시 최소 80% 이상의 커버리지 유지를 원칙으로 하며, 핵심 비즈니스 로직은 95% 이상을 목표로 합니다.

## 🔧 설치 및 실행

### **Prerequisites**

- [Node.js 18+](https://nodejs.org/)
- [npm 9+](https://www.npmjs.com/)
- [백엔드 서버](https://github.com/Yeongdong/stock-trading-backend)

### **Quick Start**

```bash
# 1. 저장소 클론
git clone https://github.com/Yeongdong/stock-trading-frontend.git
cd stock-trading-frontend

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 파일에서 API 엔드포인트 및 Google OAuth 설정

# 4. 개발 서버 실행
npm run dev
```

### **환경변수 설정**

```bash
# 백엔드 API 서버 주소
NEXT_PUBLIC_API_BASE_URL=http://localhost:7072/api
NEXT_PUBLIC_SIGNALR_HUB_URL=http://localhost:7072/stockhub

# Google OAuth 클라이언트 ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

🌐 **실행 후 접속:** `http://localhost:3000`

## 🔮 향후 개발 계획

- [ ] **React Server Components** 도입으로 초기 로딩 성능 추가 개선
- [ ] **PWA (Progressive Web App)** 구현으로 네이티브 앱 경험 제공
- [ ] **AI 기반 투자 추천** 시스템 연동

---

## 📞 연락처

**정영동** - 풀스택 개발자

- 📧 **이메일**: jyd37855@gmail.com
- 🐙 **GitHub**: [GitHub 프로필](https://github.com/Yeongdong)
- 🔧 **백엔드 저장소**: [Stock Trading Backend](https://github.com/Yeongdong/stock-trading-backend)

> 이 프로젝트는 실제 비즈니스 문제를 기술로 해결하는 과정을 담은 성장 기록입니다. 복잡한 금융 도메인을 통해 **아키텍처 설계, 성능 최적화, 문제 해결 능력**을 기를 수 있었으며, 실무에서 바로 기여할 수 있는 개발자로 성장했습니다.
