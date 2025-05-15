"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import {
  StockSubscriptionProvider,
  useStockSubscription,
} from "./StockSubscriptionContext";
import {
  RealtimePriceProvider,
  useRealtimePrice,
} from "./RealtimePriceContext";
import { ChartDataProvider, useChartData } from "./ChartDataContext";
import { StockDataContextType } from "@/types/contexts/stockData";

// Context 생성
const StockDataContext = createContext<StockDataContextType | undefined>(
  undefined
);

// 내부 컴포넌트
const StockDataContextInner: React.FC<{ children: ReactNode }> = React.memo(
  ({ children }) => {
    const subscription = useStockSubscription();
    const realtimePrice = useRealtimePrice();
    const chartData = useChartData();

    const error = useMemo(
      () => subscription.error || realtimePrice.error || null,
      [subscription.error, realtimePrice.error]
    );

    const getStockData = useCallback(
      (symbol: string) => realtimePrice.getStockData(symbol),
      [realtimePrice]
    );

    const getChartData = useCallback(
      (symbol: string) => chartData.getChartData(symbol),
      [chartData]
    );

    const contextValue = useMemo(
      () => ({
        stockData: realtimePrice.stockData,
        subscribedSymbols: subscription.subscribedSymbols,
        isLoading: subscription.isLoading,
        error,
        subscribeSymbol: subscription.subscribeSymbol,
        unsubscribeSymbol: subscription.unsubscribeSymbol,
        isSubscribed: subscription.isSubscribed,
        getStockData,
        getChartData,
      }),
      [
        realtimePrice.stockData,
        subscription.subscribedSymbols,
        subscription.isLoading,
        error,
        subscription.subscribeSymbol,
        subscription.unsubscribeSymbol,
        subscription.isSubscribed,
        getStockData,
        getChartData,
      ]
    );

    return (
      <StockDataContext.Provider value={contextValue}>
        {children}
      </StockDataContext.Provider>
    );
  }
);

StockDataContextInner.displayName = "StockDataContextInner";

export const StockDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <StockSubscriptionProvider>
      <RealtimePriceProvider>
        <ChartDataProvider>
          <StockDataContextInner>{children}</StockDataContextInner>
        </ChartDataProvider>
      </RealtimePriceProvider>
    </StockSubscriptionProvider>
  );
};

export const useStockData = () => {
  const context = useContext(StockDataContext);
  if (context === undefined) {
    throw new Error("useStockData must be used within a StockDataProvider");
  }
  return context;
};
