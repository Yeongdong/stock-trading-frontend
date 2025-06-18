// export interface RateLimitConfig {
//   readonly requestsPerSecond: number;
//   readonly burstLimit: number;
//   readonly retryDelay: number;
//   readonly maxRetries: number;
//   readonly timeoutMs: number;
// }

export interface QueueStatus {
  readonly queueLength: number;
  readonly processing: boolean;
  readonly requestCount: number;
  readonly lastRequestTime: number;
}

// export enum RequestPriority {
//   LOW = 1,
//   NORMAL = 2,
//   HIGH = 3,
//   CRITICAL = 4, // 실시간 주문
// }

export class RateLimitError extends Error {
  constructor(message: string, public readonly retryAfter?: number) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class RequestTimeoutError extends Error {
  constructor(message: string = "Request timeout") {
    super(message);
    this.name = "RequestTimeoutError";
  }
}

export class RequestCancelledError extends Error {
  constructor(message: string = "Request cancelled") {
    super(message);
    this.name = "RequestCancelledError";
  }
}

abstract class BaseQueueItem {
  public retryCount = 0;

  constructor(
    public readonly id: string,
    public readonly priority: RequestPriority,
    public readonly endpoint: string,
    public readonly method: string,
    public readonly maxRetries: number,
    public readonly createdAt: number = Date.now()
  ) {}

  abstract execute(): Promise<void>;
  abstract cancel(): void;
}

class QueueItem<T> extends BaseQueueItem {
  constructor(
    id: string,
    priority: RequestPriority,
    endpoint: string,
    method: string,
    maxRetries: number,
    private readonly executeFunction: () => Promise<T>,
    private readonly resolve: (value: T) => void,
    private readonly reject: (error: Error) => void
  ) {
    super(id, priority, endpoint, method, maxRetries);
  }

  async execute(): Promise<void> {
    try {
      const result = await this.executeFunction();
      this.resolve(result);
    } catch (error) {
      this.reject(error as Error);
    }
  }

  cancel(): void {
    this.reject(new RequestCancelledError());
  }
}

export class RateLimiter {
  private readonly queue: BaseQueueItem[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private requestCount = 0;
  private windowStart = 0;

  private readonly config: RateLimitConfig;

  constructor(customConfig?: Partial<RateLimitConfig>) {
    this.config = {
      requestsPerSecond: 1,
      burstLimit: 2,
      retryDelay: 1200,
      maxRetries: 3,
      timeoutMs: 10000,
      ...customConfig,
    };
  }

  /**
   * API 요청을 큐에 추가
   */
  public async enqueue<T>(
    id: string,
    priority: RequestPriority,
    endpoint: string,
    method: string,
    executeFunction: () => Promise<T>,
    maxRetries?: number
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queueItem = new QueueItem<T>(
        id,
        priority,
        endpoint,
        method,
        maxRetries ?? this.config.maxRetries,
        executeFunction,
        resolve,
        reject
      );

      this.addToQueue(queueItem);
      this.processQueue().catch((error) => {
        console.error("Queue processing error:", error);
      });
    });
  }

  /**
   * 특정 요청 취소
   */
  public cancelRequest(requestId: string): boolean {
    const index = this.queue.findIndex((item) => item.id === requestId);
    if (index === -1) return false;

    const item = this.queue.splice(index, 1)[0];
    item.cancel();
    return true;
  }

  /**
   * 큐 상태 조회
   */
  public getQueueStatus(): QueueStatus {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
    };
  }

  /**
   * 요청을 큐에 추가하고 정렬
   */
  private addToQueue(item: BaseQueueItem): void {
    this.queue.push(item);
    this.sortQueueByPriority();
  }

  /**
   * 우선순위별로 큐 정렬
   */
  private sortQueueByPriority(): void {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt - b.createdAt;
    });
  }

  /**
   * 큐 처리 메인 로직
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) break;

        await this.processQueueItem(item);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * 개별 큐 아이템 처리
   */
  private async processQueueItem(item: BaseQueueItem): Promise<void> {
    try {
      await this.waitForRateLimit();
      await this.executeWithTimeout(item);
      this.updateRequestCount();
    } catch (error) {
      await this.handleQueueItemError(item, error as Error);
    }
  }

  /**
   * Rate limit 준수를 위한 대기
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();

    await this.handleWindowReset(now);
    await this.handleBurstLimit(now);
    await this.handleMinimumInterval(now);
  }

  /**
   * 시간 윈도우 리셋 처리
   */
  private async handleWindowReset(now: number): Promise<void> {
    if (now - this.windowStart >= 1000) {
      this.requestCount = 0;
      this.windowStart = now;
    }
  }

  /**
   * 버스트 제한 처리
   */
  private async handleBurstLimit(now: number): Promise<void> {
    if (this.requestCount >= this.config.burstLimit) {
      const waitTime = 1000 - (now - this.windowStart);
      if (waitTime > 0) {
        await this.delay(waitTime);
        this.requestCount = 0;
        this.windowStart = Date.now();
      }
    }
  }

  /**
   * 최소 간격 보장
   */
  private async handleMinimumInterval(now: number): Promise<void> {
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.config.requestsPerSecond;

    if (timeSinceLastRequest < minInterval)
      await this.delay(minInterval - timeSinceLastRequest);
  }

  /**
   * 타임아웃이 있는 실행
   */
  private async executeWithTimeout(item: BaseQueueItem): Promise<void> {
    return Promise.race([item.execute(), this.createTimeoutPromise()]);
  }

  /**
   * 타임아웃 Promise 생성
   */
  private createTimeoutPromise(): Promise<void> {
    return new Promise<void>((_, reject) =>
      setTimeout(() => reject(new RequestTimeoutError()), this.config.timeoutMs)
    );
  }

  /**
   * 큐 아이템 오류 처리
   */
  private async handleQueueItemError(
    item: BaseQueueItem,
    error: Error
  ): Promise<void> {
    const shouldRetry = this.shouldRetryItem(item, error);

    if (shouldRetry) {
      await this.retryQueueItem(item, error);
    } else {
      this.rejectQueueItem(item, error);
    }
  }

  /**
   * 재시도 여부 판단
   */
  private shouldRetryItem(item: BaseQueueItem, error: Error): boolean {
    if (item.retryCount >= item.maxRetries) return false;

    if (
      error instanceof RequestTimeoutError ||
      error instanceof RequestCancelledError
    )
      return false;

    return this.isRetryableError(error);
  }

  /**
   * 재시도 가능한 오류인지 판단
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    return (
      message.includes("초당 거래건수") ||
      message.includes("rate limit") ||
      message.includes("429") ||
      message.includes("network") ||
      message.includes("timeout")
    );
  }

  /**
   * 큐 아이템 재시도 처리
   */
  private async retryQueueItem(
    item: BaseQueueItem,
    error: Error
  ): Promise<void> {
    item.retryCount++;

    const delay = this.calculateRetryDelay(item, error);

    console.warn(
      `Request ${item.id} failed, retrying in ${delay}ms ` +
        `(attempt ${item.retryCount}/${item.maxRetries}):`,
      error.message
    );

    await this.delay(delay);
    this.queue.unshift(item);
    this.sortQueueByPriority();
  }

  /**
   * 재시도 지연 시간 계산
   */
  private calculateRetryDelay(item: BaseQueueItem, error: Error): number {
    const isRateLimitError = this.isRateLimitError(error);

    if (isRateLimitError) return this.config.retryDelay * 2;

    // Exponential backoff
    return this.config.retryDelay * Math.pow(2, item.retryCount - 1);
  }

  /**
   * Rate limit 오류 여부 판단
   */
  private isRateLimitError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes("초당 거래건수") || message.includes("rate limit");
  }

  /**
   * 큐 아이템 최종 거부
   */
  private rejectQueueItem(item: BaseQueueItem, error: Error): void {
    console.error(`Request ${item.id} failed permanently:`, error);
    item.cancel();
  }

  /**
   * 요청 카운트 업데이트
   */
  private updateRequestCount(): void {
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * 지연 유틸리티
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const rateLimiter = new RateLimiter();
