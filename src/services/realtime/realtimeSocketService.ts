import * as signalR from "@microsoft/signalr";
import {
  EventDataMap,
  EventTypes,
  RealtimeStockData,
  TradeExecutionData,
} from "@/types";
import { LIMITS } from "@/constants";
import { tokenStorage } from "../api/auth/tokenStorage";

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

      // JWT 토큰 확인
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        this.handleError("인증 토큰이 없습니다. 로그인이 필요합니다.");
        return false;
      }

      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => tokenStorage.getAccessToken() || "",
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
      if (error instanceof Error && error.message.includes("401")) {
        const refreshed = await this.refreshTokenAndRetry();
        if (refreshed) {
          return this.start();
        }
      }

      this.handleError("SignalR 연결에 실패했습니다.");
      this.scheduleReconnect();
      return false;
    }
  }

  private async refreshTokenAndRetry(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          tokenStorage.setAccessToken(data.accessToken, data.expiresIn || 3600);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on("Connected", (data) => {
      this.notifySubscribers("connected", data);
    });

    this.hubConnection.on("ReceiveStockPrice", (data: RealtimeStockData) => {
      this.notifySubscribers("stockPrice", data);
    });

    this.hubConnection.on(
      "ReceiveTradeExecution",
      (data: TradeExecutionData) => {
        this.notifySubscribers("tradeExecution", data);
      }
    );
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= LIMITS.MAX_RECONNECT_ATTEMPTS) {
      this.handleError("최대 재연결 시도 횟수를 초과했습니다.");
      return;
    }

    const delay = Math.min(2000 * Math.pow(2, this.reconnectAttempts), 32000);
    this.reconnectAttempts++;

    setTimeout(() => {
      this.start();
    }, delay);
  }

  private handleError(message: string): void {
    if (this.errorCallback) {
      this.errorCallback(message);
    }
  }

  private notifySubscribers<T extends EventTypes>(
    event: T,
    data: EventDataMap[T]
  ): void {
    this.subscribers[event].forEach((callback) => callback(data));
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

  public async stop(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
    this.reconnectAttempts = 0;
  }

  public getConnectionState(): string {
    return this.hubConnection?.state || "Disconnected";
  }
}

export const realtimeSocketService = new RealtimeSocketService();
