import { useState, useEffect } from "react";

interface MarketInfo {
  isOpen: boolean;
  statusText: string;
  statusIcon: string;
}

/**
 * 장 상태를 확인하고 실시간 기능 사용 가능 여부를 판단하는 훅
 */
export const useMarketGuard = () => {
  const [marketInfo, setMarketInfo] = useState<MarketInfo>({
    isOpen: false,
    statusText: "확인중",
    statusIcon: "⏳",
  });

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 100 + minutes;

    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

    const isMarketHours = currentTime >= 900 && currentTime <= 1530;
    const isOpen = isWeekday && isMarketHours;

    let statusText: string;
    let statusIcon: string;

    if (!isWeekday) {
      statusText = "휴장";
      statusIcon = "🏢";
    } else if (isOpen) {
      statusText = "장중";
      statusIcon = "📈";
    } else if (currentTime < 900) {
      statusText = "장전";
      statusIcon = "⏰";
    } else {
      statusText = "장후";
      statusIcon = "🌙";
    }

    setMarketInfo({
      isOpen,
      statusText,
      statusIcon,
    });
  }, []);

  return marketInfo;
};
