import { RequestPriority } from "./rateLimiter";

/**
 * API 엔드포인트별 우선순위 매핑 규칙
 */
export interface ApiPriorityRule {
  readonly pattern: RegExp;
  readonly methods: string[];
  readonly priority: RequestPriority;
  readonly description: string;
}

export const API_PRIORITY_RULES: ApiPriorityRule[] = [
  // CRITICAL: 실시간 주문 관련
  {
    pattern: /\/api\/trading\/order$/,
    methods: ["POST", "PUT", "PATCH"],
    priority: RequestPriority.CRITICAL,
    description: "실시간 주식 주문",
  },
  {
    pattern: /\/api\/trading\/order\/cancel/,
    methods: ["POST", "DELETE"],
    priority: RequestPriority.CRITICAL,
    description: "주문 취소",
  },
  {
    pattern: /\/api\/trading\/order\/modify/,
    methods: ["POST", "PUT"],
    priority: RequestPriority.CRITICAL,
    description: "주문 정정",
  },

  // HIGH: 거래 관련 중요 정보 (빠른 응답 필요)
  {
    pattern: /\/api\/trading\/balance/,
    methods: ["GET"],
    priority: RequestPriority.HIGH,
    description: "계좌 잔고 조회",
  },
  {
    pattern: /\/api\/trading\/buyableinquiry/,
    methods: ["GET"],
    priority: RequestPriority.HIGH,
    description: "매수가능금액 조회",
  },
  {
    pattern: /\/api\/trading\/orderexecution/,
    methods: ["GET"],
    priority: RequestPriority.HIGH,
    description: "주문체결내역 조회",
  },
  {
    pattern: /\/api\/market\/stock\/current-price/,
    methods: ["GET"],
    priority: RequestPriority.HIGH,
    description: "현재가 조회 (주문 시 필수)",
  },

  // NORMAL: 일반적인 시세 및 데이터 조회
  {
    pattern: /\/api\/market\/stock\/search/,
    methods: ["GET"],
    priority: RequestPriority.NORMAL,
    description: "종목 검색",
  },
  {
    pattern: /\/api\/market\/realtime\/subscribe/,
    methods: ["POST", "DELETE"],
    priority: RequestPriority.NORMAL,
    description: "실시간 데이터 구독",
  },
  {
    pattern: /\/api\/market\/realtime\/(start|stop)/,
    methods: ["POST"],
    priority: RequestPriority.NORMAL,
    description: "실시간 데이터 서비스",
  },
  {
    pattern: /\/api\/auth\//,
    methods: ["GET", "POST"],
    priority: RequestPriority.NORMAL,
    description: "인증 관련",
  },
  {
    pattern: /\/api\/user\//,
    methods: ["GET", "POST", "PUT"],
    priority: RequestPriority.NORMAL,
    description: "사용자 정보",
  },

  // LOW: 과거 데이터, 차트, 통계 등
  {
    pattern: /\/api\/market\/stock\/periodPrice/,
    methods: ["GET"],
    priority: RequestPriority.LOW,
    description: "기간별 주가 (차트용)",
  },
  {
    pattern: /\/api\/market\/stock\/update-from-krx/,
    methods: ["POST"],
    priority: RequestPriority.LOW,
    description: "KRX 데이터 업데이트",
  },
  {
    pattern: /\/api\/market\/stock\/\d+$/,
    methods: ["GET"],
    priority: RequestPriority.LOW,
    description: "종목 상세 정보",
  },
];

export class ApiPriorityManager {
  /**
   * URL과 메서드를 기반으로 정확한 우선순위 결정
   */
  static determinePriority(url: string, method: string): RequestPriority {
    // 정확한 패턴 매칭으로 우선순위 결정
    for (const rule of API_PRIORITY_RULES) {
      if (
        rule.pattern.test(url) &&
        rule.methods.includes(method.toUpperCase())
      ) {
        return rule.priority;
      }
    }

    // 기본값: 알 수 없는 API는 낮은 우선순위
    return RequestPriority.LOW;
  }

  /**
   * 특정 상황에서 우선순위 동적 조정
   */
  static adjustPriorityForContext(
    basePriority: RequestPriority,
    context: {
      isMarketOpen?: boolean;
      hasActiveOrders?: boolean;
      isUserInitiated?: boolean;
    }
  ): RequestPriority {
    let adjustedPriority = basePriority;

    // 장 마감 시간에는 대부분의 우선순위를 낮춤
    if (context.isMarketOpen === false) {
      if (basePriority === RequestPriority.HIGH) {
        adjustedPriority = RequestPriority.NORMAL;
      } else if (basePriority === RequestPriority.NORMAL) {
        adjustedPriority = RequestPriority.LOW;
      }
    }

    // 활성 주문이 있을 때는 관련 API 우선순위를 높임
    if (context.hasActiveOrders && basePriority === RequestPriority.NORMAL) {
      adjustedPriority = RequestPriority.HIGH;
    }

    // 사용자 직접 요청은 우선순위를 약간 높임
    if (context.isUserInitiated && basePriority === RequestPriority.LOW) {
      adjustedPriority = RequestPriority.NORMAL;
    }

    return adjustedPriority;
  }

  /**
   * 우선순위별 예상 대기 시간 계산
   */
  static getEstimatedWaitTime(
    priority: RequestPriority,
    queueLength: number
  ): number {
    const baseDelayPerRequest = 1200; // 1.2초 (KIS API rate limit)

    switch (priority) {
      case RequestPriority.CRITICAL:
        return 0; // 즉시 처리
      case RequestPriority.HIGH:
        return baseDelayPerRequest * Math.min(queueLength, 2);
      case RequestPriority.NORMAL:
        return baseDelayPerRequest * queueLength;
      case RequestPriority.LOW:
        return baseDelayPerRequest * queueLength * 1.5;
      default:
        return baseDelayPerRequest * queueLength;
    }
  }
}
