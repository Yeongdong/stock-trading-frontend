import { useEffect } from "react";
import { useRealtimePrice } from "@/contexts/RealtimePriceContext";
import { useStockData } from "@/contexts/StockDataContext";
import { useChartData } from "@/contexts/ChartDataContext";
import { useStockSubscription } from "@/contexts/StockSubscriptionContext";
import { TIMINGS } from "@/constants";

/**
 * Context 간 데이터 동기화 담당
 * UI를 렌더링하지 않고 백그라운드에서 데이터 흐름 처리
 */
const RealtimeDataSynchronizer: React.FC = () => {
  const { stockData: realtimeStockData } = useRealtimePrice();
  const { updateStockData } = useStockData();
  const { updateChartData } = useChartData();
  const { subscribedSymbols } = useStockSubscription();

  // RealtimePrice 데이터가 변경되면 StockData Context로 전파
  useEffect(() => {
    // 구독 중인 종목만 동기화
    subscribedSymbols.forEach((symbol) => {
      const data = realtimeStockData[symbol];
      if (data) {
        updateStockData(symbol, data);
      }
    });
  }, [realtimeStockData, subscribedSymbols, updateStockData]);

  // 차트 데이터 업데이트 (최적화: 타이머 사용)
  useEffect(() => {
    const intervalId = setInterval(() => {
      subscribedSymbols.forEach((symbol) => {
        const data = realtimeStockData[symbol];
        if (data) {
          updateChartData(data);
        }
      });
    }, TIMINGS.STOCK_PRICE_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [realtimeStockData, subscribedSymbols, updateChartData]);

  return null;
};

export default RealtimeDataSynchronizer;
