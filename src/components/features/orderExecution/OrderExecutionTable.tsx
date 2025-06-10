import React from "react";
import { OrderExecutionTableProps } from "@/types/components/orderExecution";
import styles from "./OrderExecutionTable.module.css";

const OrderExecutionTable: React.FC<OrderExecutionTableProps> = ({
  items,
  isLoading,
}) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDate = (dateStr: string) => {
    // YYYYMMDD -> YYYY-MM-DD
    if (dateStr.length === 8)
      return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(
        6,
        8
      )}`;

    return dateStr;
  };

  const formatTime = (timeStr: string) => {
    // HHMMSS -> HH:MM:SS
    if (timeStr.length === 6)
      return `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(
        4,
        6
      )}`;

    return timeStr;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>주문체결내역을 조회하는 중...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>조회된 체결내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.orderExecutionTableContainer}>
      <div className={styles.tableHeader}>
        <h4>체결내역 (총 {items.length}건)</h4>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.orderExecutionTable}>
          <thead>
            <tr>
              <th>주문일자</th>
              <th>종목명</th>
              <th>매매구분</th>
              <th>주문수량</th>
              <th>주문가격</th>
              <th>체결수량</th>
              <th>체결가격</th>
              <th>체결금액</th>
              <th>주문상태</th>
              <th>체결시간</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.orderNumber}-${index}`}>
                <td>{formatDate(item.orderDate)}</td>
                <td>
                  <div className={styles.stockInfo}>
                    <span className={styles.stockName}>{item.stockName}</span>
                    <span className={styles.stockCode}>({item.stockCode})</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`${styles.orderSide} ${
                      item.orderSide === "매수" ? styles.buy : styles.sell
                    }`}
                  >
                    {item.orderSide}
                  </span>
                </td>
                <td className={styles.number}>
                  {formatNumber(item.orderQuantity)}
                </td>
                <td className={styles.number}>
                  {formatNumber(item.orderPrice)}원
                </td>
                <td className={styles.number}>
                  {formatNumber(item.executedQuantity)}
                </td>
                <td className={styles.number}>
                  {formatNumber(item.executedPrice)}원
                </td>
                <td className={styles.number}>
                  {formatNumber(item.executedAmount)}원
                </td>
                <td>
                  <span className={styles.orderStatus}>{item.orderStatus}</span>
                </td>
                <td>{formatTime(item.executionTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderExecutionTable;
