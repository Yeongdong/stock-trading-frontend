import { requestQueue } from "../requestQueue";

describe("RequestQueue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("기본 요청 처리", () => {
    it("단일 요청을 처리한다", async () => {
      const mockRequest = jest.fn().mockResolvedValue("success");

      const result = await requestQueue.add(mockRequest);

      expect(mockRequest).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("요청 결과를 정확히 반환한다", async () => {
      const testData = { id: 1, name: "테스트" };
      const mockRequest = jest.fn().mockResolvedValue(testData);

      const result = await requestQueue.add(mockRequest);

      expect(result).toEqual(testData);
    });

    it("요청 에러를 올바르게 전파한다", async () => {
      const testError = new Error("요청 실패");
      const mockRequest = jest.fn().mockRejectedValue(testError);

      await expect(requestQueue.add(mockRequest)).rejects.toThrow("요청 실패");
    });
  });

  describe("순차 처리", () => {
    it("여러 요청을 순차적으로 처리한다", async () => {
      const executionOrder: number[] = [];

      const request1 = jest.fn().mockImplementation(async () => {
        executionOrder.push(1);
        return "result1";
      });

      const request2 = jest.fn().mockImplementation(async () => {
        executionOrder.push(2);
        return "result2";
      });

      const request3 = jest.fn().mockImplementation(async () => {
        executionOrder.push(3);
        return "result3";
      });

      // 동시에 큐에 추가
      const promises = [
        requestQueue.add(request1),
        requestQueue.add(request2),
        requestQueue.add(request3),
      ];

      const results = await Promise.all(promises);

      expect(executionOrder).toEqual([1, 2, 3]);
      expect(results).toEqual(["result1", "result2", "result3"]);
    });
  });

  describe("간격 제한", () => {
    it("최소 간격을 보장한다 (실제 시간 테스트)", async () => {
      const timestamps: number[] = [];

      const createTimestampRequest = () =>
        jest.fn().mockImplementation(async () => {
          timestamps.push(Date.now());
          return "success";
        });

      const request1 = createTimestampRequest();
      const request2 = createTimestampRequest();

      const startTime = Date.now();

      await Promise.all([
        requestQueue.add(request1),
        requestQueue.add(request2),
      ]);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 두 요청 사이에 최소 500ms 간격이 있어야 하므로 총 시간이 500ms 이상이어야 함
      expect(totalTime).toBeGreaterThanOrEqual(500);
      expect(timestamps.length).toBe(2);

      if (timestamps.length >= 2) {
        const timeDiff = timestamps[1] - timestamps[0];
        expect(timeDiff).toBeGreaterThanOrEqual(500);
      }
    }, 10000); // 실제 시간 테스트이므로 타임아웃 증가
  });

  describe("에러 처리", () => {
    it("한 요청이 실패해도 다음 요청을 계속 처리한다", async () => {
      const failingRequest = jest.fn().mockRejectedValue(new Error("실패"));
      const successRequest = jest.fn().mockResolvedValue("성공");

      // 첫 번째 요청은 실패
      await expect(requestQueue.add(failingRequest)).rejects.toThrow("실패");

      // 두 번째 요청은 성공해야 함
      const result = await requestQueue.add(successRequest);
      expect(result).toBe("성공");
      expect(successRequest).toHaveBeenCalled();
    });

    it("여러 요청이 실패해도 각각 독립적으로 처리한다", async () => {
      const error1 = new Error("에러1");
      const error2 = new Error("에러2");

      const failingRequest1 = jest.fn().mockRejectedValue(error1);
      const failingRequest2 = jest.fn().mockRejectedValue(error2);
      const successRequest = jest.fn().mockResolvedValue("성공");

      const promises = [
        requestQueue.add(failingRequest1).catch((err) => err),
        requestQueue.add(failingRequest2).catch((err) => err),
        requestQueue.add(successRequest),
      ];

      const results = await Promise.all(promises);

      expect(results[0]).toEqual(error1);
      expect(results[1]).toEqual(error2);
      expect(results[2]).toBe("성공");
    });
  });

  describe("동시성 처리", () => {
    it("동시에 추가된 요청들을 순차적으로 처리한다", async () => {
      const results: string[] = [];

      const createRequest = (id: string) =>
        jest.fn().mockImplementation(async () => {
          results.push(id);
          return id;
        });

      const requests = [
        createRequest("A"),
        createRequest("B"),
        createRequest("C"),
      ];

      // 모든 요청을 동시에 큐에 추가
      const promises = requests.map((req) => requestQueue.add(req));

      await Promise.all(promises);

      // 순서대로 실행되었는지 확인
      expect(results).toEqual(["A", "B", "C"]);
    });
  });

  describe("타입 안정성", () => {
    it("제네릭 타입을 올바르게 처리한다", async () => {
      interface TestData {
        id: number;
        name: string;
      }

      const testData: TestData = { id: 1, name: "테스트" };
      const mockRequest = jest.fn().mockResolvedValue(testData);

      const result = await requestQueue.add<TestData>(mockRequest);

      expect(result.id).toBe(1);
      expect(result.name).toBe("테스트");
    });
  });
});
