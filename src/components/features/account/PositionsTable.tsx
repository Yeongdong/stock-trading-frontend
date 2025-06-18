import { useState } from "react";

import { formatKRW } from "@/utils/formatters";
import styles from "./PositionsTable.module.css";
import { Position } from "@/types/domains/stock";
import { PositionsTableProps } from "@/types";

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

  const getSortClassName = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortOrder === "asc" ? styles.sortAsc : styles.sortDesc;
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
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.positionsTable}>
          <thead>
            <tr>
              <th
                onClick={() => handleSort("prdt_name")}
                className={getSortClassName("prdt_name")}
              >
                종목명
              </th>
              <th
                onClick={() => handleSort("hldg_qty")}
                className={getSortClassName("hldg_qty")}
              >
                보유수량
              </th>
              <th
                onClick={() => handleSort("pchs_avg_pric")}
                className={getSortClassName("pchs_avg_pric")}
              >
                매입평균가격
              </th>
              <th
                onClick={() => handleSort("prpr")}
                className={getSortClassName("prpr")}
              >
                현재가
              </th>
              <th
                onClick={() => handleSort("evlu_pfls_amt")}
                className={getSortClassName("evlu_pfls_amt")}
              >
                평가손익
              </th>
              <th
                onClick={() => handleSort("evlu_pfls_rt")}
                className={getSortClassName("evlu_pfls_rt")}
              >
                평가손익률
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPositions.length > 0 ? (
              sortedPositions.map((position) => (
                <tr key={position.pdno}>
                  <td className={styles.stockName}>{position.prdt_name}</td>
                  <td className={styles.number}>
                    {parseInt(position.hldg_qty).toLocaleString()}
                  </td>
                  <td className={styles.number}>
                    {formatKRW(position.pchs_avg_pric)}
                  </td>
                  <td className={styles.number}>{formatKRW(position.prpr)}</td>
                  <td className={styles.number}>
                    {formatKRW(position.evlu_pfls_amt)}
                  </td>
                  <td className={styles.number}>{position.evlu_pfls_rt}%</td>
                </tr>
              ))
            ) : (
              <tr className={styles.emptyRow}>
                <td colSpan={6}>보유 종목이 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
