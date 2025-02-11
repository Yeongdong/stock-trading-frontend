import { useState } from "react";
import { Position } from "@/types";
import { formatKRW } from "@/utils/formatters";

interface PositionsTableProps {
  positions: Position[];
}

type SortKey = keyof Position;
type SortOrder = "asc" | "desc";

export const PositionsTable = ({ positions }: PositionsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("stockName");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedPositions = [...positions].sort((a, b) => {
    if (sortKey === "profitLossRate" || sortKey === "quantity") {
      const aValue = parseFloat(a[sortKey]);
      const bValue = parseFloat(b[sortKey]);
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    const aValue = a[sortKey];
    const bValue = b[sortKey];
    return sortOrder === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => handleSort("stockName")}>종목명</th>
          <th onClick={() => handleSort("quantity")}>보유수량</th>
          <th onClick={() => handleSort("averagePrice")}>평균단가</th>
          <th onClick={() => handleSort("currentPrice")}>현재가</th>
          <th onClick={() => handleSort("profitLoss")}>평가손익</th>
          <th onClick={() => handleSort("profitLossRate")}>수익률</th>
        </tr>
      </thead>
      <tbody>
        {sortedPositions.map((position) => (
          <tr key={position.stockCode}>
            <td>{position.stockName}</td>
            <td>{parseInt(position.quantity).toLocaleString()}</td>
            <td>{formatKRW(position.averagePrice)}</td>
            <td>{formatKRW(position.currentPrice)}</td>
            <td>{formatKRW(position.profitLoss)}</td>
            <td>{formatKRW(position.profitLossRate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
