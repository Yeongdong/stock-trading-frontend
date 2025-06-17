import { OrderExecutionSearchFormProps } from "@/types/components/orderExecution";
import React, { useState } from "react";
import styles from "./OrderExecutionSearchForm.module.css";
import { OrderExecutionInquiryRequest } from "@/types/order/execution";

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const get30DaysAgoString = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split("T")[0];
};

const OrderExecutionSearchForm: React.FC<OrderExecutionSearchFormProps> = ({
  onSearch,
  isLoading,
}) => {
  const [startDate, setStartDate] = useState(get30DaysAgoString());
  const [endDate, setEndDate] = useState(getTodayString());
  const [stockCode, setStockCode] = useState("");
  const [orderType, setOrderType] = useState("00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      alert("조회 기간을 입력해주세요.");
      return;
    }

    const formatDate = (date: string) => date.replace(/-/g, "");
    const request: OrderExecutionInquiryRequest = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      stockCode: stockCode.trim() || undefined,
      orderType,
    };

    onSearch(request);
  };

  return (
    <div className={styles.orderExecutionSearchForm}>
      <h3>주문체결내역 조회</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate">조회시작일</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={getTodayString()}
              disabled={isLoading}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endDate">조회종료일</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={getTodayString()}
              disabled={isLoading}
              required
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="stockCode">종목코드 (선택)</label>
            <input
              type="text"
              id="stockCode"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              placeholder="예: 005930 (삼성전자)"
              maxLength={6}
              pattern="[0-9]*"
              disabled={isLoading}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="orderType">매매구분</label>
            <select
              id="orderType"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              disabled={isLoading}
              className={styles.select}
            >
              <option value="00">전체</option>
              <option value="02">매수</option>
              <option value="01">매도</option>
            </select>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.searchButton}
          >
            {isLoading ? "조회중..." : "조회"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderExecutionSearchForm;
