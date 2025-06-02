import * as signalR from "@microsoft/signalr";
import {
  StockTransaction,
  TradeExecutionData,
  EventTypes,
  EventDataMap,
  ErrorInfo,
} from "@/types";
import { LIMITS, TIMINGS, ERROR_MESSAGES } from "@/constants";

export class RealtimeSocketService {
  private hubConnection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = LIMITS.MAX_RECONNECT_ATTEMPTS;
  private subscribers: {
    [K in EventTypes]: Array<(data: EventDataMap[K]) => void>;
  } = {
    stockPrice: [],
    tradeExecution: [],
    connected: [],
  };

  private errorCallback: ((error: string) => void) | null = null;

  constructor(
    private readonly hubUrl: string = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL ||
      "https://localhost:7072/stockhub"
  ) {}

  public setErrorCallback(callback: (error: string) => void): void {
    this.errorCallback = callback;
  }

  public async start(): Promise<boolean> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      console.log("📡 [SignalR] 이미 연결된 상태입니다.");
      return true;
    }

    try {
      console.log("🔗 [SignalR] 연결 시작:", this.hubUrl);

      // 기존 연결이 있다면 정리
      if (this.hubConnection) {
        await this.hubConnection.stop();
        this.hubConnection = null;
      }

      // Hub 연결 설정
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          // 쿠키 기반 인증 사용
          withCredentials: true,
          // 연결 타임아웃 설정
          timeout: 30000,
          // 전송 방식 명시적 설정
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.ServerSentEvents,
          // 로그 레벨 설정
          logMessageContent: true,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            console.log(
              `🔄 [SignalR] 재연결 시도 ${
                retryContext.previousRetryCount + 1
              }/${this.maxReconnectAttempts}`
            );

            if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
              return null; // 재연결 중단
            }

            // 지수 백오프: 2초, 4초, 8초, 16초, 32초
            return Math.min(
              2000 * Math.pow(2, retryContext.previousRetryCount),
              32000
            );
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // 이벤트 핸들러 등록
      this.registerEventHandlers();

      console.log("🔌 [SignalR] 연결 시작...");
      // 연결 시작
      await this.hubConnection.start();

      console.log("✅ [SignalR] 연결 성공!");
      console.log("📊 [SignalR] 연결 상태:", this.hubConnection.state);
      console.log("🆔 [SignalR] 연결 ID:", this.hubConnection.connectionId);

      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error("❌ [SignalR] 연결 실패:", error);
      this.handleError(ERROR_MESSAGES.REALTIME.CONNECTION_FAILED);
      this.reconnect();
      return false;
    }
  }

  // 연결 종료
  public async stop(): Promise<void> {
    console.log("🛑 [SignalR] stop() 호출됨");

    if (this.hubConnection) {
      console.log("🔌 [SignalR] 연결 종료 중...");
      await this.hubConnection.stop();
      this.hubConnection = null;
      console.log("✅ [SignalR] 연결 종료 완료");
    }
  }

  // 인증 토큰 가져오기
  private getAuthToken(): string {
    // 쿠키에서 토큰 가져오기 (서버에서 설정한 방식과 동일)
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    console.log("🍪 [SignalR] 쿠키에서 토큰 조회:", token ? "찾음" : "없음");

    return token || "";
  }

  // 이벤트 핸들러 등록
  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    console.log("📡 [SignalR] 이벤트 핸들러 등록 시작");

    // 연결 완료 이벤트
    this.hubConnection.on("Connected", (connectionId: string) => {
      console.log(`🔗 [SignalR] Connected 이벤트 - ID: ${connectionId}`);
    });

    // 실시간 주가 데이터 수신 이벤트
    this.hubConnection.on("ReceiveStockPrice", (data: StockTransaction) => {
      console.log("📈 [SignalR] ReceiveStockPrice 이벤트 수신:", {
        symbol: data.symbol,
        price: data.price,
        change: data.priceChange,
        changeRate: data.changeRate,
        volume: data.volume,
        time: data.transactionTime,
        fullData: data,
      });

      this.notifySubscribers("stockPrice", data);
    });

    // 거래 체결 정보 수신 이벤트
    this.hubConnection.on(
      "ReceiveTradeExecution",
      (data: TradeExecutionData) => {
        console.log("💼 [SignalR] ReceiveTradeExecution 이벤트 수신:", data);
        this.notifySubscribers("tradeExecution", data);
      }
    );

    // 연결 해제 이벤트
    this.hubConnection.onclose((error) => {
      console.log("🚪 [SignalR] 연결 해제됨:", error);
      if (error) {
        this.handleError(ERROR_MESSAGES.REALTIME.CONNECTION_LOST);
        this.reconnect();
      }
    });

    // 재연결 이벤트
    this.hubConnection.onreconnecting((error) => {
      console.log("🔄 [SignalR] 재연결 시도 중:", error);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log("🔗 [SignalR] 재연결 완료:", connectionId);
    });

    // 오류 이벤트
    this.hubConnection.on("error", (error: ErrorInfo) => {
      console.error("⚠️ [SignalR] 오류 이벤트:", error);
      const errorMessage =
        error?.message || ERROR_MESSAGES.REALTIME.CONNECTION_FAILED;
      this.handleError(errorMessage);
    });

    console.log("✅ [SignalR] 이벤트 핸들러 등록 완료");
  }

  // 오류 처리
  private handleError(errorMessage: string): void {
    console.error("💥 [SignalR] 오류 처리:", errorMessage);
    if (this.errorCallback) {
      this.errorCallback(errorMessage);
    }
  }

  // 재연결 시도
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("🚫 [SignalR] 최대 재연결 시도 횟수 초과");
      this.handleError(ERROR_MESSAGES.REALTIME.MAX_RECONNECT_ATTEMPTS);
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `🔄 [SignalR] 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
    );

    setTimeout(() => {
      this.start();
    }, TIMINGS.RECONNECT_DELAY * this.reconnectAttempts);
  }

  // 이벤트 구독
  public subscribe<T extends EventTypes>(
    eventName: T,
    callback: (data: EventDataMap[T]) => void
  ): () => void {
    console.log(`🎯 [SignalR] 이벤트 구독: ${eventName}`);
    this.subscribers[eventName].push(callback);

    console.log(
      `📊 [SignalR] ${eventName} 구독자 수:`,
      this.subscribers[eventName].length
    );

    // 구독 취소 함수 반환
    return () => {
      const index = this.subscribers[eventName].indexOf(callback);
      if (index !== -1) {
        this.subscribers[eventName].splice(index, 1);
        console.log(
          `🗑️ [SignalR] ${eventName} 구독 취소, 남은 구독자:`,
          this.subscribers[eventName].length
        );
      }
    };
  }

  // 구독자에게 데이터 전달
  private notifySubscribers<T extends EventTypes>(
    eventName: T,
    data: EventDataMap[T]
  ): void {
    console.log(`📢 [SignalR] notifySubscribers 호출: ${eventName}`, {
      eventName,
      data,
      subscriberCount: this.subscribers[eventName]?.length || 0,
    });

    if (this.subscribers[eventName] && this.subscribers[eventName].length > 0) {
      this.subscribers[eventName].forEach((callback, index) => {
        try {
          console.log(`🔔 [SignalR] 구독자 ${index}에게 알림 전송`);
          callback(data);
          console.log(`✅ [SignalR] 구독자 ${index} 알림 완료`);
        } catch (error) {
          console.error(`❌ [SignalR] 구독자 ${index} 알림 중 오류:`, error);
        }
      });
    } else {
      console.warn(`⚠️ [SignalR] ${eventName}에 대한 구독자가 없습니다`);
    }
  }

  // 서버 메서드 호출(종목 구독 요청 등)
  public async invoke<T>(methodName: string, ...args: unknown[]): Promise<T> {
    console.log(`📤 [SignalR] 서버 메서드 호출: ${methodName}`, args);

    if (!this.hubConnection) {
      console.log("🔌 [SignalR] 연결이 없어서 연결 시작");
      await this.start();
    }

    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        const result = await this.hubConnection.invoke(methodName, ...args);
        console.log(
          `✅ [SignalR] 서버 메서드 호출 성공: ${methodName}`,
          result
        );
        return result;
      } catch (error) {
        console.error(
          `❌ [SignalR] 서버 메서드 호출 실패: ${methodName}`,
          error
        );
        throw error;
      }
    } else {
      const error = new Error("SignalR 연결이 활성화되지 않음");
      console.error(
        "🚫 [SignalR]",
        error.message,
        "현재 상태:",
        this.hubConnection?.state
      );
      throw error;
    }
  }

  // 연결 상태 확인
  public getConnectionState(): string {
    return this.hubConnection?.state || "Disconnected";
  }

  // 연결 ID 확인
  public getConnectionId(): string | null {
    return this.hubConnection?.connectionId || null;
  }

  // 구독자 수 확인 (디버깅용)
  public getSubscriberCount(eventName: EventTypes): number {
    return this.subscribers[eventName]?.length || 0;
  }

  // 전체 구독자 정보 (디버깅용)
  public getAllSubscribers(): Record<EventTypes, number> {
    return {
      stockPrice: this.subscribers.stockPrice.length,
      tradeExecution: this.subscribers.tradeExecution.length,
      connected: this.subscribers.connected.length,
    };
  }

  // 수동 테스트 데이터 전송 (디버깅용)
  public async sendTestMessage(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke("SendTestData");
        console.log("🧪 [SignalR] 테스트 메시지 전송 완료");
      } catch (error) {
        console.error("❌ [SignalR] 테스트 메시지 전송 실패:", error);
      }
    } else {
      console.error("🚫 [SignalR] 연결되지 않음 - 테스트 메시지 전송 불가");
    }
  }
}

export const realtimeSocketService = new RealtimeSocketService();

// 디버깅을 위해 전역 객체에 추가
if (typeof window !== "undefined") {
  (window as any).realtimeSocketService = realtimeSocketService;
}
