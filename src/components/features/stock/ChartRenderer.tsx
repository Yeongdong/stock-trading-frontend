import React, { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts";
import { ChartRendererProps } from "@/types";

const ChartRenderer: React.FC<ChartRendererProps> = memo(
  ({ data, yDomain, startPrice, lineColor, height }) => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
        <ReferenceLine y={startPrice} strokeDasharray="3 3" stroke="#757575" />

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
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false} // 실시간 데이터에서 애니메이션 비활성화
        />
      </LineChart>
    </ResponsiveContainer>
  )
);

ChartRenderer.displayName = "ChartRenderer";

export default ChartRenderer;
