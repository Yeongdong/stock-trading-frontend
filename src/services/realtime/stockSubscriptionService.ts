import { API, STORAGE_KEYS } from "@/constants";
import { apiClient } from "../api/common/apiClient";
import { SubscriptionsResponse } from "@/types";

/**
 * 주식 구독 서비스
 */
export class StockSubscriptionService {
  private subscribedSymbols: string[] = [];

  constructor() {
    this.loadSubscriptions();
  }

  private loadSubscriptions(): void {
    try {
      const savedSymbols = localStorage.getItem(
        STORAGE_KEYS.SUBSCRIBED_SYMBOLS
      );
      if (savedSymbols) this.subscribedSymbols = JSON.parse(savedSymbols);
    } catch {
      // 파싱 실패 시 빈 배열로 초기화
      this.subscribedSymbols = [];
    }
  }

  private saveSubscriptions(): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SUBSCRIBED_SYMBOLS,
        JSON.stringify(this.subscribedSymbols)
      );
    } catch {}
  }

  public async initializeSubscriptions(): Promise<void> {
    await this.syncWithServer();
  }

  // 모든 구독된 종목 코드 가져오기
  public getSubscribedSymbols(): string[] {
    return [...this.subscribedSymbols];
  }

  // 특정 종목이 구독 중인지 확인
  public isSubscribed(symbol: string): boolean {
    return this.subscribedSymbols.includes(symbol);
  }

  // 새로운 종목 구독
  public async subscribeSymbol(symbol: string): Promise<boolean> {
    if (this.isSubscribed(symbol)) return true;

    const response = await apiClient.post(
      API.REALTIME.SUBSCRIBE(symbol),
      {},
      { requiresAuth: true }
    );

    if (response.data && !response.error) {
      this.subscribedSymbols.push(symbol);
      this.saveSubscriptions();
      return true;
    }

    return false;
  }

  // 종목 구독 취소
  public async unsubscribeSymbol(symbol: string): Promise<boolean> {
    if (!this.isSubscribed(symbol)) return true;

    const response = await apiClient.delete(API.REALTIME.SUBSCRIBE(symbol), {
      requiresAuth: true,
    });

    if (response.data !== undefined && !response.error) {
      this.subscribedSymbols = this.subscribedSymbols.filter(
        (s) => s !== symbol
      );
      this.saveSubscriptions();
      return true;
    }

    return false;
  }

  // 서버 구독 목록과 동기화
  public async syncWithServer(): Promise<void> {
    const response = await apiClient.get<SubscriptionsResponse>(
      API.REALTIME.SUBSCRIPTIONS,
      { requiresAuth: true }
    );

    if (response.data && !response.error) {
      this.subscribedSymbols = response.data.symbols || [];
      this.saveSubscriptions();
    }
  }
}

export const stockSubscriptionService = new StockSubscriptionService();
