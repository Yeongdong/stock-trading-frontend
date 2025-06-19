import { useCallback } from "react";

export const useDateUtils = () => {
  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
  const getTodayString = useCallback((): string => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  // N일 전 날짜를 YYYY-MM-DD 형식으로 반환
  const getDaysAgoString = useCallback((days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  }, []);

  // YYYY-MM-DD 형식을 YYYYMMDD 형식으로 변환
  const formatDateForApi = useCallback((date: string): string => {
    return date.replace(/-/g, "");
  }, []);

  // YYYYMMDD 형식을 YYYY-MM-DD 형식으로 변환
  const formatDateForDisplay = useCallback((dateStr: string): string => {
    if (dateStr.length === 8) {
      return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(
        6,
        8
      )}`;
    }
    return dateStr;
  }, []);

  // HHMMSS 형식을 HH:MM:SS 형식으로 변환
  const formatTimeForDisplay = useCallback((timeStr: string): string => {
    if (timeStr.length === 6) {
      return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(
        4,
        6
      )}`;
    }
    return timeStr;
  }, []);

  return {
    getTodayString,
    getDaysAgoString,
    formatDateForApi,
    formatDateForDisplay,
    formatTimeForDisplay,
  };
};
