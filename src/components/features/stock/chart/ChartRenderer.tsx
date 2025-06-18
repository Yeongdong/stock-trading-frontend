import { ChartRendererProps } from "@/types";
import React, { memo, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";

const ChartRenderer: React.FC<ChartRendererProps> = memo(
  ({ data, yDomain, startPrice, lineColor, height }) => {
    // 차트 데이터를 메모이제이션
    const chartData = useMemo(() => data, [data]);

    // 차트 설정을 메모이제이션
    const chartConfig = useMemo(
      () => ({
        margin: { top: 5, right: 5, left: 5, bottom: 5 },
        yDomain,
        startPrice,
        lineColor,
        height,
      }),
      [yDomain, startPrice, lineColor, height]
    );

    return (
      <ResponsiveContainer width="100%" height={chartConfig.height}>
        <LineChart data={chartData} margin={chartConfig.margin}>
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
            domain={chartConfig.yDomain}
            tick={{ fontSize: 10 }}
            tickFormatter={(price) => price.toLocaleString()} // 천 단위 구분
            width={40}
          />

          {/* 시작 가격 기준선 */}
          <ReferenceLine
            y={chartConfig.startPrice}
            strokeDasharray="3 3"
            stroke="#757575"
          />

          {/* 툴팁 */}
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
            stroke={chartConfig.lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false} // 실시간 데이터에서 애니메이션 비활성화
          />
        </LineChart>
      </ResponsiveContainer>
    );
  },
  // props 비교 함수로 불필요한 리렌더링 방지
  (prevProps, nextProps) => {
    return (
      prevProps.data === nextProps.data &&
      prevProps.yDomain[0] === nextProps.yDomain[0] &&
      prevProps.yDomain[1] === nextProps.yDomain[1] &&
      prevProps.startPrice === nextProps.startPrice &&
      prevProps.lineColor === nextProps.lineColor &&
      prevProps.height === nextProps.height
    );
  }
);

ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;
