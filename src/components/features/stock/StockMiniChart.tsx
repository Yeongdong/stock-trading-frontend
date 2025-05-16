import React, { useMemo, useRef, useEffect, useState, memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { StockMiniChartProps, PriceDataPoint, StockTransaction } from "@/types";

const CHART_UPDATE_INTERVAL = 500;

const StockMiniChart: React.FC<StockMiniChartProps> = memo(
  ({ symbol, height = 120 }) => {
    const { getChartData, getStockData } = useStockOperations();

    const [chartData, setChartData] = useState<PriceDataPoint[]>([]);
    const [currentStock, setCurrentStock] = useState<StockTransaction | null>(
      null
    );

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 주기적으로 차트 데이터 업데이트
    useEffect(() => {
      const updateChartData = () => {
        const latestChartData = getChartData(symbol);
        const latestStockData = getStockData(symbol);

        setChartData(latestChartData);
        setCurrentStock(latestStockData);
      };

      // 초기 데이터 설정
      updateChartData();

      // 주기적 업데이트 설정
      timerRef.current = setInterval(updateChartData, CHART_UPDATE_INTERVAL);

      return () => {
        // 정리: 타이머 제거
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [symbol, getChartData, getStockData]);

    // 차트 데이터가 충분한지 확인
    const hasData = chartData.length > 1;

    // Y축 최소/최대값 계산
    const yDomain = useMemo(() => {
      if (!hasData) return [0, 0];

      const prices = chartData.map((point) => point.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      // 마진 약간 추가(범위의 5%)
      const margin = (max - min) * 0.05;
      return [Math.floor(min - margin), Math.ceil(max + margin)];
    }, [chartData, hasData]);

    // 시작 가격(첫 번째 데이터 포인트)
    const startPrice = useMemo(
      () => (hasData ? chartData[0].price : 0),
      [chartData, hasData]
    );

    // 가격 변화에 따른 선 색상
    const lineColor = useMemo(() => {
      if (!hasData || chartData.length < 2) return "#ccc";

      const lastPrice = chartData[chartData.length - 1].price;
      if (lastPrice > startPrice) return "#e53935"; // 상승(빨강)
      if (lastPrice < startPrice) return "#2196f3"; // 하락(파랑)
      return "#757575"; // 변동 없음(회색)
    }, [chartData, startPrice, hasData]);

    // 가격 변화율 계산
    const priceChangePercentage = useMemo(() => {
      if (!hasData || !currentStock) return 0;
      return ((currentStock.price - startPrice) / startPrice) * 100;
    }, [currentStock, startPrice, hasData]);

    // 가격 변화율 클래스
    const priceChangeClass = useMemo(() => {
      if (priceChangePercentage > 0) return "price-up";
      if (priceChangePercentage < 0) return "price-down";
      return "";
    }, [priceChangePercentage]);

    if (!hasData) {
      return (
        <div className="stock-mini-chart-placeholder">
          <p>차트 데이터 수집 중...</p>
        </div>
      );
    }

    return (
      <div className="stock-mini-chart">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            {/* X축 (시간) */}
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              tickFormatter={(time) => time.split(":")[1]} // 분:초만 표시
              minTickGap={15}
              height={20}
            />

            {/* Y축 (가격) */}
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 10 }}
              tickFormatter={(price) => price.toLocaleString()} // 천 단위 구분
              width={40}
            />

            {/* 시작 가격 기준선 */}
            <ReferenceLine
              y={startPrice}
              strokeDasharray="3 3"
              stroke="#757575"
            />

            {/* 툴팁 - 비용이 큰 컴포넌트이므로 필요한 경우만 사용 */}
            <Tooltip
              formatter={(value) => [
                `${Number(value).toLocaleString()} 원`,
                "가격",
              ]}
              labelFormatter={(time) => `시간: ${time}`}
            />

            {/* 가격선 */}
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} // 실시간 데이터에서 애니메이션 비활성화
            />
          </LineChart>
        </ResponsiveContainer>

        {/* 차트 정보 */}
        <div className="chart-info">
          <div className="chart-label">
            <span>시작:</span>
            <span className="chart-value">
              {startPrice.toLocaleString()} 원
            </span>
          </div>
          {currentStock && (
            <div className="chart-label">
              <span>현재:</span>
              <span className="chart-value">
                {currentStock.price.toLocaleString()} 원{" "}
                <span className={priceChangeClass}>
                  ({priceChangePercentage.toFixed(2)}%)
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

StockMiniChart.displayName = "StockMiniChart";

export default StockMiniChart;
