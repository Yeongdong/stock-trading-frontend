"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { StockDataContextType } from "@/types";
import { useStockSubscription } from "./StockSubscriptionContext";
import { useRealtimePrice } from "./RealtimePriceContext";
import { useChartData } from "./ChartDataContext";

const StockDataContext = createContext<StockDataContextType | undefined>(
  undefined
);

export const StockDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const subscription = useStockSubscription();
  const realtimePrice = useRealtimePrice();
  const chartData = useChartData();

  const error = useMemo(
    () => subscription.error || realtimePrice.error || null,
    [subscription.error, realtimePrice.error]
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
      getStockData: realtimePrice.getStockData,
      getChartData: chartData.getChartData,
    }),
    [
      realtimePrice.stockData,
      subscription.subscribedSymbols,
      subscription.isLoading,
      error,
      subscription.subscribeSymbol,
      subscription.unsubscribeSymbol,
      subscription.isSubscribed,
      realtimePrice.getStockData,
      chartData.getChartData,
    ]
  );

  return (
    <StockDataContext.Provider value={contextValue}>
      {children}
    </StockDataContext.Provider>
  );
};

export const useStockData = () => {
  const context = useContext(StockDataContext);
  if (context === undefined) {
    throw new Error("useStockData must be used within a StockDataProvider");
  }
  return context;
};
