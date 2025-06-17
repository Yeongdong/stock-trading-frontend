import { API, STORAGE_KEYS } from "@/constants";
import { apiClient } from "../api/common/apiClient";
import { SubscriptionsResponse } from "@/types/api/realtime";

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
    } catch (error) {
      console.error("구독 목록 로드 중 오류", error);
      this.subscribedSymbols = [];
    }
  }

  // 로컬 스토리지에 구독 정보 저장
  private saveSubscriptions(): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SUBSCRIBED_SYMBOLS,
        JSON.stringify(this.subscribedSymbols)
      );
    } catch (error) {
      console.error("구독 목록 저장 중 오류:", error);
    }
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

    try {
      const response = await apiClient.post(
        API.REALTIME.SUBSCRIBE(symbol),
        {},
        {
          requiresAuth: true,
        }
      );

      if (response.status !== 200) return false;

      // 구독 목록에 추가
      this.subscribedSymbols.push(symbol);
      this.saveSubscriptions();

      return true;
    } catch (error) {
      console.error(`종목 구독 실패: ${symbol}`, error);
      return false;
    }
  }

  // 종목 구독 취소
  public async unsubscribeSymbol(symbol: string): Promise<boolean> {
    if (!this.isSubscribed(symbol)) return true;

    try {
      const response = await apiClient.delete(API.REALTIME.SUBSCRIBE(symbol), {
        requiresAuth: true,
      });

      if (response.status !== 200) return false;

      // 구독 목록에서 제거
      this.subscribedSymbols = this.subscribedSymbols.filter(
        (s) => s !== symbol
      );
      this.saveSubscriptions();

      return true;
    } catch (error) {
      console.error(`종목 구독 취소 실패: ${symbol}`, error);
      return false;
    }
  }

  // 모든 종목 초기화(앱 시작시)
  public async initializeSubscriptions(): Promise<void> {
    try {
      // 서버의 구독 목록 가져오기
      const serverSubscriptions = await this.fetchSubscriptionsFromServer();

      // 로컬 구독 목록과 서버 구독 목록 비교 및 동기화
      const localOnly = this.subscribedSymbols.filter(
        (s) => !serverSubscriptions.includes(s)
      );
      const serverOnly = serverSubscriptions.filter(
        (s) => !this.subscribedSymbols.includes(s)
      );

      // 서버에 없는 로컬 구독 추가
      for (const symbol of localOnly) {
        await apiClient.post(
          API.REALTIME.SUBSCRIBE(symbol),
          {},
          {
            handleError: false, // 초기화 중 개별 오류는 무시
          }
        );
      }

      // 로컬에 없는 서버 구독 추가
      for (const symbol of serverOnly) {
        this.subscribedSymbols.push(symbol);
      }

      this.saveSubscriptions();
      console.log("구독 목록 초기화 완료");
    } catch (error) {
      console.error("구독 목록 초기화 중 오류:", error);
    }
  }

  // 서버의 구독 목록 가져오기
  private async fetchSubscriptionsFromServer(): Promise<string[]> {
    try {
      const response = await apiClient.get<SubscriptionsResponse>(
        API.REALTIME.SUBSCRIPTIONS,
        {
          requiresAuth: true,
          handleError: false,
        }
      );

      if (response.status !== 200) {
        return [];
      }

      return response.data?.symbols || [];
    } catch (error) {
      console.error("서버 구독 목록 조회 중 오류:", error);
      return [];
    }
  }
}

export const stockSubscriptionService = new StockSubscriptionService();
