import * as signalR from "@microsoft/signalr";
import {
  TradeExecutionData,
  EventTypes,
  EventDataMap,
  ErrorInfo,
  RealtimeStockData,
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
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected)
      return true;

    try {
      // 기존 연결이 있다면 정리
      if (this.hubConnection) {
        await this.hubConnection.stop();
        this.hubConnection = null;
      }

      // Hub 연결 설정
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          withCredentials: true,
          timeout: 30000,
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.ServerSentEvents,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
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
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // 이벤트 핸들러 등록
      this.registerEventHandlers();

      console.log("SignalR 연결 시작...");
      // 연결 시작
      await this.hubConnection.start();
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error("SignalR 연결 실패:", error);
      this.handleError(ERROR_MESSAGES.REALTIME.CONNECTION_FAILED);
      this.reconnect();
      return false;
    }
  }

  // 연결 종료
  public async stop(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  // 이벤트 핸들러 등록
  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    // 연결 완료 이벤트
    this.hubConnection.on("Connected", (connectionId: string) => {
      console.log(`SignalR Connected 이벤트 - ID: ${connectionId}`);
    });

    // 실시간 주가 데이터 수신 이벤트
    this.hubConnection.on("ReceiveStockPrice", (data: RealtimeStockData) => {
      // 데이터 유효성 검사
      if (!data || !data.symbol) {
        console.error("유효하지 않은 주가 데이터:", data);
        return;
      }

      this.notifySubscribers("stockPrice", data);
    });

    // 거래 체결 정보 수신 이벤트
    this.hubConnection.on(
      "ReceiveTradeExecution",
      (data: TradeExecutionData) => {
        this.notifySubscribers("tradeExecution", data);
      }
    );

    // 연결 해제 이벤트
    this.hubConnection.onclose((error) => {
      if (error) {
        console.error("SignalR 연결 해제:", error);
        this.handleError(ERROR_MESSAGES.REALTIME.CONNECTION_LOST);
        this.reconnect();
      }
    });

    // 재연결 이벤트
    this.hubConnection.onreconnecting((error) => {
      console.warn("SignalR 재연결 시도 중:", error);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log("SignalR 재연결 완료:", connectionId);
    });

    // 오류 이벤트
    this.hubConnection.on("error", (error: ErrorInfo) => {
      console.error("SignalR 오류:", error);
      const errorMessage =
        error?.message || ERROR_MESSAGES.REALTIME.CONNECTION_FAILED;
      this.handleError(errorMessage);
    });
  }

  // 오류 처리
  private handleError(errorMessage: string): void {
    if (this.errorCallback) this.errorCallback(errorMessage);
  }

  // 재연결 시도
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("최대 재연결 시도 횟수 초과");
      this.handleError(ERROR_MESSAGES.REALTIME.MAX_RECONNECT_ATTEMPTS);
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      this.start();
    }, TIMINGS.RECONNECT_DELAY * this.reconnectAttempts);
  }

  // 이벤트 구독
  public subscribe<T extends EventTypes>(
    eventName: T,
    callback: (data: EventDataMap[T]) => void
  ): () => void {
    this.subscribers[eventName].push(callback);

    // 구독 취소 함수 반환
    return () => {
      const index = this.subscribers[eventName].indexOf(callback);
      if (index !== -1) this.subscribers[eventName].splice(index, 1);
    };
  }

  // 구독자에게 데이터 전달
  private notifySubscribers<T extends EventTypes>(
    eventName: T,
    data: EventDataMap[T]
  ): void {
    if (this.subscribers[eventName] && this.subscribers[eventName].length > 0) {
      this.subscribers[eventName].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`구독자 알림 중 오류 (${eventName}):`, error);
        }
      });
    }
  }

  // 서버 메서드 호출(종목 구독 요청 등)
  public async invoke<T>(methodName: string, ...args: unknown[]): Promise<T> {
    if (!this.hubConnection) await this.start();

    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        const result = await this.hubConnection.invoke(methodName, ...args);
        return result;
      } catch (error) {
        console.error(`서버 메서드 호출 실패 (${methodName}):`, error);
        throw error;
      }
    } else {
      const error = new Error("SignalR 연결이 활성화되지 않음");
      console.error(error.message, "현재 상태:", this.hubConnection?.state);
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
}

export const realtimeSocketService = new RealtimeSocketService();
