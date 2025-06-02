import React, { useState, useEffect } from "react";
import { useRealtimeDebug } from "@/hooks/debug/useRealtimeDebug";
import { realtimeSocketService } from "@/services/realtime/realtimeSocketService";

const RealtimeDebugPanel: React.FC = () => {
  const {
    debugInfo,
    isLoading,
    runFullDiagnosis,
    sendTestData,
    checkSignalRStatus,
    checkKisConnection,
    forceKisDataSimulation,
  } = useRealtimeDebug();
  const [symbol, setSymbol] = useState("005930");
  const [realtimeData, setRealtimeData] = useState<any>({});

  useEffect(() => {
    const interval = setInterval(() => {
      // 전역 상태에서 실시간 데이터 확인
      const socketService = (window as any).realtimeSocketService;
      if (socketService) {
        const status = {
          connectionState: socketService.getConnectionState(),
          connectionId: socketService.getConnectionId(),
          subscribers: socketService.getAllSubscribers(),
          timestamp: new Date().toISOString(),
        };
        setRealtimeData(status);
      }
    }, 2000); // 2초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "#f8f9fa",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        maxWidth: "400px",
        fontSize: "12px",
        zIndex: 9999,
      }}
    >
      <h4>🔧 실시간 데이터 진단 패널</h4>

      <div style={{ marginBottom: "12px" }}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="종목코드"
          style={{ marginRight: "8px", padding: "4px" }}
        />
      </div>
      <div
        style={{
          marginTop: "12px",
          padding: "8px",
          backgroundColor: "#d4edda",
          borderRadius: "4px",
          fontSize: "10px",
        }}
      >
        <strong>📡 실시간 모니터링:</strong>
        <div>연결: {realtimeData.connectionState || "Unknown"}</div>
        <div>구독자: {JSON.stringify(realtimeData.subscribers || {})}</div>
        <div>마지막 업데이트: {realtimeData.timestamp || "Never"}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={runFullDiagnosis}
          disabled={isLoading}
          style={{
            padding: "8px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          {isLoading ? "진단 중..." : "🏥 종합 진단"}
        </button>

        <button
          onClick={() => sendTestData(symbol)}
          disabled={isLoading}
          style={{
            padding: "8px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          🧪 테스트 데이터 전송
        </button>

        <button
          onClick={checkSignalRStatus}
          style={{
            padding: "8px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          📡 SignalR 상태 확인
        </button>

        <button
          onClick={() => realtimeSocketService.sendTestMessage()}
          style={{
            padding: "8px",
            backgroundColor: "#ffc107",
            color: "black",
            border: "none",
            borderRadius: "4px",
          }}
        >
          🔔 SignalR 테스트 메시지
        </button>

        <button
          onClick={checkKisConnection}
          style={{
            padding: "8px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          🔌 KIS 연결 상태
        </button>

        <button
          onClick={forceKisDataSimulation}
          style={{
            padding: "8px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          🚀 KIS 데이터 시뮬레이션
        </button>
      </div>

      {debugInfo && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px",
            backgroundColor: "#e9ecef",
            borderRadius: "4px",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          <strong>📊 진단 결과:</strong>
          <pre style={{ fontSize: "10px", margin: "4px 0" }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RealtimeDebugPanel;
