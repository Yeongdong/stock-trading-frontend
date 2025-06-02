import { useState, useCallback } from "react";
import { API } from "@/constants";
import { apiClient } from "@/services/api/common/apiClient";

export const useRealtimeDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 실시간 서비스 상태 확인
  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔍 [Debug] 실시간 서비스 상태 확인 시작");

      const response = await apiClient.get(
        `${API.REALTIME.START.replace("/start", "/status")}`,
        {
          requiresAuth: true,
        }
      );

      console.log("📊 [Debug] 서버 상태:", response.data);
      setDebugInfo((prev) => ({ ...prev, serverStatus: response.data }));

      return response.data;
    } catch (error) {
      console.error("❌ [Debug] 상태 확인 실패:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 테스트 데이터 전송
  const sendTestData = useCallback(async (symbol: string = "005930") => {
    try {
      setIsLoading(true);
      console.log(`🧪 [Debug] 테스트 데이터 전송 시작: ${symbol}`);

      const response = await apiClient.post(
        `${API.REALTIME.START.replace("/start", "")}/test-data/${symbol}`,
        {},
        { requiresAuth: true }
      );

      console.log("📊 [Debug] 테스트 데이터 응답:", response.data);
      setDebugInfo((prev) => ({ ...prev, testDataResponse: response.data }));

      return response.data;
    } catch (error) {
      console.error("❌ [Debug] 테스트 데이터 전송 실패:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // SignalR 연결 상태 확인
  const checkSignalRStatus = useCallback(() => {
    const socketService = (window as any).realtimeSocketService;

    if (socketService) {
      const status = {
        connectionState: socketService.getConnectionState(),
        connectionId: socketService.getConnectionId(),
        subscribers: socketService.getAllSubscribers(),
      };

      console.log("📡 [Debug] SignalR 상태:", status);
      setDebugInfo((prev) => ({ ...prev, signalrStatus: status }));

      return status;
    }

    console.warn("⚠️ [Debug] SignalR 서비스를 찾을 수 없음");
    return null;
  }, []);

  // KIS 연결 상태 확인
  const checkKisConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔍 [Debug] KIS 연결 상태 확인 시작");

      const response = await apiClient.get(
        `${API.REALTIME.START.replace("/start", "")}/debug/kis-connection`,
        { requiresAuth: true }
      );

      console.log("📊 [Debug] KIS 연결 상태:", response.data);
      setDebugInfo((prev) => ({ ...prev, kisConnection: response.data }));

      return response.data;
    } catch (error) {
      console.error("❌ [Debug] KIS 연결 상태 확인 실패:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // KIS 데이터 시뮬레이션
  const forceKisDataSimulation = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🧪 [Debug] KIS 데이터 시뮬레이션 시작");

      const response = await apiClient.post(
        `${API.REALTIME.START.replace("/start", "")}/debug/force-kis-data`,
        {},
        { requiresAuth: true }
      );

      console.log("📊 [Debug] KIS 시뮬레이션 응답:", response.data);
      setDebugInfo((prev) => ({ ...prev, kisSimulation: response.data }));

      return response.data;
    } catch (error) {
      console.error("❌ [Debug] KIS 시뮬레이션 실패:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testProcessorDirectly = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🧪 [Debug] Processor 직접 테스트 시작");

      const response = await apiClient.post(
        `${API.REALTIME.START.replace("/start", "")}/debug/test-processor`,
        {},
        { requiresAuth: true }
      );

      console.log("📊 [Debug] Processor 테스트 응답:", response.data);
      setDebugInfo((prev) => ({ ...prev, processorTest: response.data }));

      return response.data;
    } catch (error) {
      console.error("❌ [Debug] Processor 테스트 실패:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 종합 진단
  const runFullDiagnosis = useCallback(async () => {
    console.log("🏥 [Debug] 종합 진단 시작");

    // 1. SignalR 상태 확인
    const signalrStatus = checkSignalRStatus();

    // 2. 서버 상태 확인
    const serverStatus = await checkStatus();

    // 3. KIS 연결 상태 확인
    const kisConnection = await checkKisConnection();

    // 4. 테스트 데이터 전송
    const testResult = await sendTestData();

    // 5. KIS 데이터 시뮬레이션
    const kisSimulation = await forceKisDataSimulation();

    // 6. Processor 직접 테스트
    const processorTest = await testProcessorDirectly();

    const diagnosis = {
      timestamp: new Date().toISOString(),
      signalrStatus,
      serverStatus,
      kisConnection,
      testResult,
      kisSimulation,
      processorTest,
      recommendations: [],
    };

    // 진단 결과 분석 (기존 코드 + 추가)
    if (!signalrStatus || signalrStatus.connectionState !== "Connected") {
      diagnosis.recommendations.push("SignalR 연결 문제 - 재연결 필요");
    }

    if (!serverStatus) {
      diagnosis.recommendations.push("서버 상태 확인 불가 - API 연결 문제");
    }

    if (!kisConnection) {
      diagnosis.recommendations.push("KIS 연결 상태 확인 불가");
    }

    if (!testResult) {
      diagnosis.recommendations.push(
        "테스트 데이터 전송 실패 - 브로드캐스터 문제"
      );
    }

    if (!kisSimulation) {
      diagnosis.recommendations.push(
        "KIS 시뮬레이션 실패 - 데이터 처리 파이프라인 문제"
      );
    }

    console.log("📋 [Debug] 종합 진단 결과:", diagnosis);
    setDebugInfo(diagnosis);

    return diagnosis;
  }, [
    checkSignalRStatus,
    checkStatus,
    checkKisConnection,
    sendTestData,
    forceKisDataSimulation,
    testProcessorDirectly,
  ]);

  // return 구문에 새 메서드들 추가
  return {
    debugInfo,
    isLoading,
    checkStatus,
    sendTestData,
    checkSignalRStatus,
    checkKisConnection,
    forceKisDataSimulation,
    runFullDiagnosis,
  };
};
