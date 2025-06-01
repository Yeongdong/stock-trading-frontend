import React from "react";
import { OrderExecutionTableProps } from "@/types/components/orderExecution";

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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>주문체결내역을 조회하는 중...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>조회된 체결내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="order-execution-table-container">
      <div className="table-header">
        <h4>체결내역 (총 {items.length}건)</h4>
      </div>

      <div className="table-wrapper">
        <table className="order-execution-table">
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
                  <div className="stock-info">
                    <span className="stock-name">{item.stockName}</span>
                    <span className="stock-code">({item.stockCode})</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`order-side ${
                      item.orderSide === "매수" ? "buy" : "sell"
                    }`}
                  >
                    {item.orderSide}
                  </span>
                </td>
                <td className="number">{formatNumber(item.orderQuantity)}</td>
                <td className="number">{formatNumber(item.orderPrice)}원</td>
                <td className="number">
                  {formatNumber(item.executedQuantity)}
                </td>
                <td className="number">{formatNumber(item.executedPrice)}원</td>
                <td className="number">
                  {formatNumber(item.executedAmount)}원
                </td>
                <td>
                  <span className="order-status">{item.orderStatus}</span>
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
