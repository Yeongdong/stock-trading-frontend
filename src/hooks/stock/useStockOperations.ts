import { useStockSubscription } from "@/contexts/StockSubscriptionContext";
import { useChartData } from "@/contexts/ChartDataContext";
import { useStockData } from "@/contexts/StockDataContext";

/**
 * 주식 관련 Context들을 통합하여 제공
 */
export const useStockOperations = () => {
  const subscription = useStockSubscription();
  const stockData = useStockData();
  const chartData = useChartData();

  return {
    // 구독 상태
    subscribedSymbols: subscription.subscribedSymbols,
    isLoading: subscription.isLoading || stockData.isLoading,

    // 구독 관리
    subscribeSymbol: subscription.subscribeSymbol,
    unsubscribeSymbol: subscription.unsubscribeSymbol,
    isSubscribed: subscription.isSubscribed,

    // 데이터 접근
    getStockData: stockData.getStockData,
    getChartData: chartData.getChartData,
  };
};
