import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { StockTransaction } from "@/types";
import { PriceDataPoint } from "@/contexts/ChartDataContext";
import {
  StockSubscriptionProvider,
  useStockSubscription,
} from "./StockSubscriptionContext";
import {
  RealtimePriceProvider,
  useRealtimePrice,
} from "./RealtimePriceContext";
import { ChartDataProvider, useChartData } from "./ChartDataContext";

interface StockDataContextType {
  stockData: Record<string, StockTransaction>;
  subscribedSymbols: string[];
  isLoading: boolean;
  error: string | null;
  subscribeSymbol: (symbol: string) => Promise<boolean>;
  unsubscribeSymbol: (symbol: string) => Promise<boolean>;
  isSubscribed: (symbol: string) => boolean;
  getStockData: (symbol: string) => StockTransaction | null;
  getChartData: (symbol: string) => PriceDataPoint[];
}

// Context 생성
const StockDataContext = createContext<StockDataContextType | undefined>(
  undefined
);

const StockDataContextInner: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const subscription = useStockSubscription();
  const realtimePrice = useRealtimePrice();
  const chartData = useChartData();

  const error = subscription.error || realtimePrice.error || null;

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
    [subscription, realtimePrice, chartData, error]
  );

  return (
    <StockDataContext.Provider value={contextValue}>
      {children}
    </StockDataContext.Provider>
  );
};

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
