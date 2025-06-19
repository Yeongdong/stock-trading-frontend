import { useMemo } from "react";
import { MARKET_HOURS, MARKET_STATUS } from "@/constants/market";
import { MarketInfo } from "@/types";

/**
 * 현재 시장 운영 상태를 확인하는 훅
 */
export const useMarketStatus = (): MarketInfo => {
  return useMemo((): MarketInfo => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 주말 체크 (0: 일요일, 6: 토요일)
    const isWeekend = currentDay === 0 || currentDay === 6;

    // 시장 운영 시간 체크
    const currentTime = currentHour * 100 + currentMinute;
    const marketOpen = MARKET_HOURS.OPEN * 100;
    const marketClose = MARKET_HOURS.CLOSE * 100 + MARKET_HOURS.CLOSE_MINUTE;
    const isMarketHours =
      currentTime >= marketOpen && currentTime <= marketClose;

    const isOpen = !isWeekend && isMarketHours;

    if (isWeekend)
      return {
        isOpen: false,
        statusText: MARKET_STATUS.CLOSED_WEEKEND.text,
        statusIcon: MARKET_STATUS.CLOSED_WEEKEND.icon,
      };

    if (isOpen)
      return {
        isOpen: true,
        statusText: MARKET_STATUS.OPEN.text,
        statusIcon: MARKET_STATUS.OPEN.icon,
      };

    if (currentTime < marketOpen)
      return {
        isOpen: false,
        statusText: MARKET_STATUS.PRE_MARKET.text,
        statusIcon: MARKET_STATUS.PRE_MARKET.icon,
      };

    return {
      isOpen: false,
      statusText: MARKET_STATUS.POST_MARKET.text,
      statusIcon: MARKET_STATUS.POST_MARKET.icon,
    };
  }, []);
};
