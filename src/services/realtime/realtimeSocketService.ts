import * as signalR from "@microsoft/signalr";
import { RealtimeStockData } from "@/types";
import { LIMITS, TIMINGS } from "@/constants";
import {
  ErrorInfo,
  EventDataMap,
  EventTypes,
  TradeExecutionData,
} from "@/types/realtime/realtime";

export class RealtimeSocketService {
  private hubConnection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
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
      if (this.hubConnection) {
        await this.hubConnection.stop();
        this.hubConnection = null;
      }

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
            if (
              retryContext.previousRetryCount >= LIMITS.MAX_RECONNECT_ATTEMPTS
            )
              return null;

            return Math.min(
              2000 * Math.pow(2, retryContext.previousRetryCount),
              32000
            );
          },
        })
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.registerEventHandlers();
      await this.hubConnection.start();
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error(error);
      this.handleError("SignalR 연결에 실패했습니다.");
      this.scheduleReconnect();
      return false;
    }
  }

  public async stop(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  public subscribe<T extends EventTypes>(
    eventName: T,
    callback: (data: EventDataMap[T]) => void
  ): () => void {
    this.subscribers[eventName].push(callback);

    return () => {
      const index = this.subscribers[eventName].indexOf(callback);
      if (index !== -1) {
        this.subscribers[eventName].splice(index, 1);
      }
    };
  }

  public getConnectionState(): string {
    return this.hubConnection?.state || "Disconnected";
  }

  public getConnectionId(): string | null {
    return this.hubConnection?.connectionId || null;
  }

  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on("Connected", (connectionId: string) => {
      this.notifySubscribers("connected", { connectionId });
    });

    this.hubConnection.on("ReceiveStockPrice", (data: RealtimeStockData) => {
      if (this.isValidStockData(data)) {
        this.notifySubscribers("stockPrice", data);
      }
    });

    this.hubConnection.on(
      "ReceiveTradeExecution",
      (data: TradeExecutionData) => {
        this.notifySubscribers("tradeExecution", data);
      }
    );

    this.hubConnection.onclose((error) => {
      if (error) {
        this.handleError("연결이 끊어졌습니다.");
        this.scheduleReconnect();
      }
    });

    this.hubConnection.onreconnected(() => {
      this.reconnectAttempts = 0;
    });

    this.hubConnection.on("error", (error: ErrorInfo) => {
      this.handleError(error?.message || "SignalR 오류가 발생했습니다.");
    });
  }

  private isValidStockData(data: RealtimeStockData): boolean {
    return !!(data && data.symbol && typeof data.price === "number");
  }

  private notifySubscribers<T extends EventTypes>(
    eventName: T,
    data: EventDataMap[T]
  ): void {
    this.subscribers[eventName].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        // 구독자 오류는 로그만 남기고 계속 진행
        console.error(error);
      }
    });
  }

  private handleError(errorMessage: string): void {
    if (this.errorCallback) {
      this.errorCallback(errorMessage);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= LIMITS.MAX_RECONNECT_ATTEMPTS) {
      this.handleError("최대 재연결 시도 횟수를 초과했습니다.");
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      this.start();
    }, TIMINGS.RECONNECT_DELAY * this.reconnectAttempts);
  }
}

export const realtimeSocketService = new RealtimeSocketService();
