"use client";

import React, { useEffect } from "react";
import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";
import { StockDataProvider, useStockData } from "@/contexts/StockDataContext";
import { ChartDataProvider, useChartData } from "@/contexts/ChartDataContext";
import { RealtimePriceProvider } from "@/contexts/RealtimePriceContext";
import { realtimeSocketService } from "@/services/realtime/realtimeSocketService";
import { useMarketGuard } from "@/hooks/realtime/useMarketGuard";
import MarketClosedNotice from "@/components/ui/MarketClosedNotice";
import styles from "./page.module.css";

function RealtimeProviderConnector({
  children,
}: {
  children: React.ReactNode;
}) {
  const { updateStockData } = useStockData();
  const { updateChartData } = useChartData();

  return (
    <RealtimePriceProvider
      contextUpdaters={{
        updateStockData,
        updateChartData,
      }}
    >
      {children}
    </RealtimePriceProvider>
  );
}

export default function RealtimePage() {
  const marketInfo = useMarketGuard();

  useEffect(() => {
    if (marketInfo.isOpen) {
      realtimeSocketService.start();
      return () => {
        realtimeSocketService.stop();
      };
    }
  }, [marketInfo.isOpen]);

  if (!marketInfo.isOpen) {
    return (
      <div className={styles.container}>
        <MarketClosedNotice
          statusIcon={marketInfo.statusIcon}
          title="실시간 서비스 일시 중단"
          statusText={marketInfo.statusText}
          description="한국거래소는 평일 오전 9시부터 오후 3시 30분까지 운영됩니다. 장 시간 외에는 실시간 데이터를 제공하지 않습니다."
          nextOpenTime={getNextOpenTime(marketInfo)}
          nextOpenLabel="다음 장 시작:"
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ChartDataProvider>
        <StockDataProvider>
          <StockSubscriptionProvider>
            <RealtimeProviderConnector>
              <RealtimeDashboard />
            </RealtimeProviderConnector>
          </StockSubscriptionProvider>
        </StockDataProvider>
      </ChartDataProvider>
    </div>
  );
}

// 다음 개장 시간 계산 유틸리티 함수
function getNextOpenTime(marketInfo: {
  isOpen: boolean;
  statusText: string;
}): string | undefined {
  const now = new Date();

  // 장이 열려있으면 다음 개장 시간 표시하지 않음
  if (marketInfo.isOpen) return undefined;

  const nextOpen = new Date(now);

  // 현재 평일이면서 장 시간 전이면 오늘 9시
  if (now.getDay() >= 1 && now.getDay() <= 5 && now.getHours() < 9) {
    nextOpen.setHours(9, 0, 0, 0);
  } else {
    // 다음 평일 9시 찾기
    const daysUntilNextWeekday =
      now.getDay() === 0
        ? 1 // 일요일이면 1일 후 (월요일)
        : now.getDay() === 6
        ? 2 // 토요일이면 2일 후 (월요일)
        : 1; // 평일이면 1일 후

    nextOpen.setDate(now.getDate() + daysUntilNextWeekday);
    nextOpen.setHours(9, 0, 0, 0);
  }

  return nextOpen.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
