# Stock Trading Frontend

한국투자증권 API를 활용한 주식 트레이딩 애플리케이션의 프론트엔드 프로젝트입니다. 실시간 주가 모니터링, 주식 주문, 계좌 잔고 조회 등의 기능을 제공합니다.

## 기술 스택

- **언어 및 프레임워크**: TypeScript, React, Next.js 13 (App Router)
- **상태 관리**: React Context API
- **UI 라이브러리**: 자체 구현 컴포넌트
- **차트 라이브러리**: Recharts
- **테스트**: Jest, React Testing Library
- **스타일링**: CSS Modules
- **API 통신**: Fetch API
- **실시간 데이터**: SignalR

## 폴더 구조

```
src/
├── app/                    # Next.js App Router 페이지
├── components/             # 리액트 컴포넌트
│   ├── common/             # 공통 컴포넌트
│   ├── features/           # 기능별 컴포넌트
│   │   ├── account/        # 계정 관련 컴포넌트
│   │   ├── auth/           # 인증 관련 컴포넌트
│   │   ├── realtime/       # 실시간 데이터 관련 컴포넌트
│   │   └── stock/          # 주식 관련 컴포넌트
│   └── system/             # 시스템 컴포넌트
├── constants/              # 상수 정의
├── contexts/               # React Context (상태 관리)
├── hooks/                  # 커스텀 훅
│   ├── common/             # 공통 훅
│   └── stock/              # 주식 관련 훅
├── services/               # API 서비스
│   ├── api/                # RESTful API 서비스
│   └── realtime/           # 실시간 데이터 서비스
├── styles/                 # 글로벌 스타일
├── types/                  # TypeScript 타입 정의
└── utils/                  # 유틸리티 함수
```

## 설치 및 실행 방법

### 사전 요구사항

- Node.js 18.x 이상
- npm 9.x 이상
- 백엔드 서버 실행 (ASP.NET Core API)

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/stock-trading-frontend.git

# 프로젝트 폴더로 이동
cd stock-trading-frontend

# 의존성 설치
npm install
```
