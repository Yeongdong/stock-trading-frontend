"use client";

import { useState, useEffect } from "react";
import { useError } from "@/contexts/ErrorContext";
import { ERROR_MESSAGES } from "@/constants";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { addError } = useError();

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      addError({
        message: ERROR_MESSAGES.NETWORK.OFFLINE,
        severity: "error",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addError]);
  return { isOnline };
}
