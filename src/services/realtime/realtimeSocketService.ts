import * as signalR from "@microsoft/signalr";
import {
  StockTransaction,
  TradeExecutionData,
  EventTypes,
  EventDataMap,
  ErrorInfo,
} from "@/types";
import { STORAGE_KEYS, LIMITS, TIMINGS, ERROR_MESSAGES } from "@/constants";

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
    if (this.hubConnection) {
      return true;
    }

    try {
      // Hub 연결 설정
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => this.getAuthToken(),
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // 이벤트 핸들러 등록
      this.registerEventHandlers();

      // 연결 시작
      await this.hubConnection.start();
      console.log("SignalR 연결 성공");
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error("SignalR 연결 실패: ", error);
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
      console.log("SignalR 연결 종료");
    }
  }

  // 인증 토큰 가져오기
  private getAuthToken(): string {
    return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || "";
  }

  // 이벤트 핸들러 등록
  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    // 연결 완료 이벤트
    this.hubConnection.on("Connected", (connectionId: string) => {
      console.log(`연결됨: ${connectionId}`);
    });

    // 실시간 주가 데이터 수신 이벤트
    this.hubConnection.on("ReceiveStockPrice", (data: StockTransaction) => {
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
      console.log("연결 해제됨", error);
      if (error) {
        this.handleError(ERROR_MESSAGES.REALTIME.CONNECTION_LOST);
        this.reconnect();
      }
    });

    // 오류 이벤트
    this.hubConnection.on("error", (error: ErrorInfo) => {
      const errorMessage =
        error?.message || ERROR_MESSAGES.REALTIME.CONNECTION_FAILED;
      this.handleError(errorMessage);
    });
  }

  // 오류 처리
  private handleError(errorMessage: string): void {
    if (this.errorCallback) {
      this.errorCallback(errorMessage);
    }
  }
  // 재연결 시도
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("최대 재연결 시도 횟수 초과");
      this.handleError(ERROR_MESSAGES.REALTIME.MAX_RECONNECT_ATTEMPTS);

      return;
    }

    this.reconnectAttempts++;
    console.log(
      `재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
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
    this.subscribers[eventName].push(callback);

    // 구독 취소 함수 반환
    return () => {
      const index = this.subscribers[eventName].indexOf(callback);
      if (index !== -1) {
        this.subscribers[eventName].splice(index, 1);
      }
    };
  }

  // 구독자에게 데이터 전달
  private notifySubscribers<T extends EventTypes>(
    eventName: T,
    data: EventDataMap[T]
  ): void {
    if (this.subscribers[eventName]) {
      this.subscribers[eventName].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`구독자 알림 중 오류 발생: ${error}`);
        }
      });
    }
  }

  // 서버 메서드 호출(종목 구독 요청 등)
  public async invoke<T>(methodName: string, ...args: unknown[]): Promise<T> {
    if (!this.hubConnection) {
      await this.start();
    }

    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return await this.hubConnection.invoke(methodName, ...args);
    } else {
      throw new Error("SignalR 연결이 활성화되지 않음");
    }
  }
}

export const realtimeSocketService = new RealtimeSocketService();
