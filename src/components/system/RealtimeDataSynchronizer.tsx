import { useEffect } from "react";
import { useRealtimePrice } from "@/contexts/RealtimePriceContext";
import { useStockData } from "@/contexts/StockDataContext";
import { useChartData } from "@/contexts/ChartDataContext";
import { useStockSubscription } from "@/contexts/StockSubscriptionContext";

/**
 * Context 간 데이터 동기화 담당
 * UI를 렌더링하지 않고 백그라운드에서 데이터 흐름 처리
 * RealtimePriceContext -> StockDataContext, ChartDataContext로 데이터 전달
 */
const RealtimeDataSynchronizer: React.FC = () => {
  const { stockData: realtimeStockData } = useRealtimePrice();
  const { updateStockData } = useStockData();
  const { updateChartData } = useChartData();
  const { subscribedSymbols } = useStockSubscription();

  useEffect(() => {
    console.log("🔄 [DataSynchronizer] 실시간 데이터 동기화 시작:", {
      realtimeDataKeys: Object.keys(realtimeStockData),
      subscribedSymbols,
    });

    // 구독 중인 종목만 동기화
    subscribedSymbols.forEach((symbol) => {
      const data = realtimeStockData[symbol];
      if (data) {
        console.log(`📤 [DataSynchronizer] ${symbol} 데이터 전달:`, {
          price: data.price,
          change: data.priceChange,
          time: data.transactionTime,
        });

        updateStockData(symbol, data);

        updateChartData(data);
      }
    });
  }, [realtimeStockData, subscribedSymbols, updateStockData, updateChartData]);

  // // 차트 데이터 업데이트 (최적화: 타이머 사용)
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     subscribedSymbols.forEach((symbol) => {
  //       const data = realtimeStockData[symbol];
  //       if (data) {
  //         updateChartData(data);
  //       }
  //     });
  //   }, TIMINGS.STOCK_PRICE_CHECK_INTERVAL);

  //   return () => clearInterval(intervalId);
  // }, [realtimeStockData, subscribedSymbols, updateChartData]);

  return null;
};

export default RealtimeDataSynchronizer;
