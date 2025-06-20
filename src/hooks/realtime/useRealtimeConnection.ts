import { useRef, useCallback } from "react";
import { realtimeSocketService } from "@/services/realtime/realtimeSocketService";
import { realtimeApiService } from "@/services/api/realtime/realtimeApiService";
import { useAuthContext } from "@/contexts/AuthContext";
import { useError } from "@/contexts/ErrorContext";

export const useRealtimeConnection = () => {
  const { isAuthenticated } = useAuthContext();
  const { addError } = useError();
  const isConnectedRef = useRef(false);

  const connect = useCallback(async () => {
    if (!isAuthenticated || isConnectedRef.current) return;

    const response = await realtimeApiService.startRealTimeService();
    if (response.error) return;

    realtimeSocketService.setErrorCallback((errorMessage) => {
      addError({
        message: `실시간 연결 오류: ${errorMessage}`,
        severity: "error",
      });
    });

    const connected = await realtimeSocketService.start();
    if (connected) isConnectedRef.current = true;
  }, [isAuthenticated, addError]);

  const disconnect = useCallback(async () => {
    if (isConnectedRef.current) {
      await realtimeApiService.stopRealTimeService();
      await realtimeSocketService.stop();
      isConnectedRef.current = false;
    }
  }, []);

  const getConnectionState = useCallback(() => {
    return realtimeSocketService.getConnectionState();
  }, []);

  return { connect, disconnect, getConnectionState };
};
