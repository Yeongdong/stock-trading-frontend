import { useState, useEffect } from "react";
import { useError } from "@/contexts/ErrorContext";
import { ERROR_MESSAGES } from "@/constants";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { addError } = useError();

  useEffect(() => {
    // 초기 온라인 상태 설정
    setIsOnline(navigator.onLine);

    // 온라인 상태 변경 이벤트 리스너
    const handleOnline = () => {
      setIsOnline(true);
      addError({
        message: ERROR_MESSAGES.NETWORK.ONLINE,
        severity: "info",
      });
    };

    // 오프라인 상태 변경 이벤트 리스너
    const handleOffline = () => {
      setIsOnline(false);
      addError({
        message: ERROR_MESSAGES.NETWORK.OFFLINE,
        severity: "error",
      });
    };

    // 이벤트 리스너 등록
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 정리 함수
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addError]);
  return { isOnline };
}
