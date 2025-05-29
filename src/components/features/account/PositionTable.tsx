import { useState } from "react";
import { Position, PositionsTableProps } from "@/types";
import { formatKRW } from "@/utils/formatters";

type SortKey = keyof Position;
type SortOrder = "asc" | "desc";

export const PositionsTable = ({ positions }: PositionsTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("prdt_name");
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
    if (sortKey === "evlu_pfls_amt" || sortKey === "hldg_qty") {
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
          <th key="prdt_name" onClick={() => handleSort("prdt_name")}>
            종목명
          </th>
          <th key="hldg_qty" onClick={() => handleSort("hldg_qty")}>
            보유수량
          </th>
          <th key="pchs_avg_pric" onClick={() => handleSort("pchs_avg_pric")}>
            매입평균가격
          </th>
          <th key="prpr" onClick={() => handleSort("prpr")}>
            현재가
          </th>
          <th key="evlu_pfls_amt" onClick={() => handleSort("evlu_pfls_amt")}>
            평가손익
          </th>
          <th key="evlu_pfls_rt" onClick={() => handleSort("evlu_pfls_rt")}>
            평가손익률
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedPositions.length > 0
          ? sortedPositions.map((position) => (
              <tr key={position.pdno}>
                <td>{position.prdt_name}</td>
                <td>{parseInt(position.hldg_qty).toLocaleString()}</td>
                <td>{formatKRW(position.pchs_avg_pric)}</td>
                <td>{formatKRW(position.prpr)}</td>
                <td>{formatKRW(position.evlu_pfls_amt)}</td>
                <td>{position.evlu_pfls_rt}%</td>
              </tr>
            ))
          : [
              <tr key="empty">
                <td colSpan={6}>보유 종목이 없습니다</td>
              </tr>,
            ]}
      </tbody>
    </table>
  );
};
