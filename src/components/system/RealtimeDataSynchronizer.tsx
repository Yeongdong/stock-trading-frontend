import { useEffect } from "react";
import { useRealtimePrice } from "@/contexts/RealtimePriceContext";
import { useStockData } from "@/contexts/StockDataContext";
import { useChartData } from "@/contexts/ChartDataContext";
import { useStockSubscription } from "@/contexts/StockSubscriptionContext";

const RealtimeDataSynchronizer: React.FC = () => {
  const { stockData: realtimeStockData } = useRealtimePrice();
  const { updateStockData } = useStockData();
  const { updateChartData } = useChartData();
  const { subscribedSymbols } = useStockSubscription();

  // 실시간 데이터 변경 감지
  useEffect(() => {
    if (Object.keys(realtimeStockData).length === 0) return;

    subscribedSymbols.forEach((symbol) => {
      const data = realtimeStockData[symbol];
      if (data) {
        try {
          updateStockData(symbol, data);
          updateChartData(data);
        } catch (error) {
          console.error(`데이터 업데이트 실패 (${symbol}):`, error);
        }
      }
    });
  }, [realtimeStockData, subscribedSymbols, updateStockData, updateChartData]);

  return null;
};

export default RealtimeDataSynchronizer;
