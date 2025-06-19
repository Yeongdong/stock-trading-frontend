import React, { memo } from "react";
import styles from "./OrderExecutionTable.module.css";
import { OrderExecutionTableProps } from "@/types";
import { useDateUtils } from "@/hooks/common/useDateUtils";

const OrderExecutionTable: React.FC<OrderExecutionTableProps> = memo(
  ({ items, isLoading }) => {
    const { formatDateForDisplay, formatTimeForDisplay } = useDateUtils();

    const formatNumber = (num: number | undefined): string => {
      if (typeof num !== "number" || isNaN(num)) return "-";
      return num.toLocaleString();
    };

    const getOrderTypeClass = (orderType: string): string => {
      return orderType === "매수" ? "buy" : "sell";
    };

    if (isLoading)
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>주문체결내역을 조회하는 중...</p>
        </div>
      );

    if (items.length === 0)
      return (
        <div className={styles.orderExecutionTableContainer}>
          <div className={styles.tableHeader}>
            <h4>체결내역</h4>
          </div>
          <div className={styles.emptyState}>
            <p>조회된 체결내역이 없습니다.</p>
          </div>
        </div>
      );

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
                <tr key={`${item.orderNumber || index}-${item.stockCode}`}>
                  <td>{formatDateForDisplay(item.orderDate)}</td>
                  <td>
                    <div className={styles.stockInfo}>
                      <span className={styles.stockName}>{item.stockName}</span>
                      <span className={styles.stockCode}>
                        ({item.stockCode})
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.orderType} ${
                        styles[getOrderTypeClass(item.orderType)]
                      }`}
                    >
                      {item.orderType}
                    </span>
                  </td>
                  <td className={styles.number}>
                    {formatNumber(item.quantity)}
                  </td>
                  <td className={styles.number}>
                    {formatNumber(item.price)}원
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
                    <span className={styles.orderStatus}>{item.status}</span>
                  </td>
                  <td>{formatTimeForDisplay(item.executionTime ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

OrderExecutionTable.displayName = "OrderExecutionTable";

export default OrderExecutionTable;
