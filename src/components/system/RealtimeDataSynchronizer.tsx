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
    const realtimeKeys = Object.keys(realtimeStockData);
    console.log("🔄 [DataSynchronizer] 실시간 데이터 변경 감지:", {
      realtimeDataKeys: realtimeKeys,
      subscribedSymbols,
      realtimeDataCount: realtimeKeys.length,
      subscribedCount: subscribedSymbols.length,
    });

    if (realtimeKeys.length === 0) {
      console.log("⚠️ [DataSynchronizer] 실시간 데이터가 비어있음");
      return;
    }

    let updatedCount = 0;

    subscribedSymbols.forEach((symbol) => {
      const data = realtimeStockData[symbol];
      if (data) {
        console.log(`📤 [DataSynchronizer] ${symbol} 데이터 전달:`, {
          price: data.price,
          change: data.priceChange,
          time: data.transactionTime,
        });

        try {
          updateStockData(symbol, data);
          updateChartData(data);
          updatedCount++;

          console.log(`✅ [DataSynchronizer] ${symbol} 업데이트 성공`);
        } catch (error) {
          console.error(
            `❌ [DataSynchronizer] ${symbol} 업데이트 실패:`,
            error
          );
        }
      } else {
        console.log(`⚠️ [DataSynchronizer] ${symbol} 데이터 없음`);
      }
    });

    console.log(
      `📊 [DataSynchronizer] 동기화 완료: ${updatedCount}/${subscribedSymbols.length}`
    );
  }, [realtimeStockData, subscribedSymbols, updateStockData, updateChartData]);

  // 주기적 상태 체크 (30초마다)
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("🔍 [DataSynchronizer] 주기적 상태 체크:", {
        realtimeDataKeys: Object.keys(realtimeStockData),
        subscribedSymbols,
        timestamp: new Date().toISOString(),
      });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [realtimeStockData, subscribedSymbols]);

  return null;
};

export default RealtimeDataSynchronizer;
