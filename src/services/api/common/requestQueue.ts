/**
 * 한국투자증권 API의 초당 호출 제한을 해결하기 위한 큐 시스템
 */
class RequestQueue {
  private queue: (() => Promise<void>)[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly MIN_INTERVAL = 500; // 500ms 간격 (초당 2개 정도로 제한)

  /**
   * 요청을 큐에 추가하고 실행
   */
  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      // 큐 처리 시작
      this.processQueue();
    });
  }

  /**
   * 큐 처리 메인 로직
   */
  private async processQueue(): Promise<void> {
    // 이미 처리 중이거나 큐가 비어있으면 종료
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (!request) break;

      // 최소 간격 보장
      await this.waitForMinInterval();

      // 요청 실행
      await request();

      // 마지막 요청 시간 업데이트
      this.lastRequestTime = Date.now();
    }

    this.processing = false;
  }

  /**
   * 최소 간격 대기
   */
  private async waitForMinInterval(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_INTERVAL) {
      const waitTime = this.MIN_INTERVAL - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

// 싱글톤 인스턴스 생성
export const requestQueue = new RequestQueue();
