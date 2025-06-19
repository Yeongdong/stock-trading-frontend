import React, { useState } from "react";
import styles from "./OrderExecutionSearchForm.module.css";
import {
  OrderExecutionInquiryRequest,
  OrderExecutionSearchFormProps,
} from "@/types";
import { useDateUtils } from "@/hooks/common/useDateUtils";
import { useOrderExecutionDefaults } from "@/hooks/orderExecution/useOrderExecutionDefaults";
import { useError } from "@/contexts/ErrorContext";

const OrderExecutionSearchForm: React.FC<OrderExecutionSearchFormProps> = ({
  onSearch,
  isLoading,
}) => {
  const { getTodayString, formatDateForApi } = useDateUtils();
  const { getDefaultDateRange } = useOrderExecutionDefaults();
  const { addError } = useError();

  const [startDate, setStartDate] = useState(getDefaultDateRange.startDate);
  const [endDate, setEndDate] = useState(getDefaultDateRange.endDate);
  const [stockCode, setStockCode] = useState("");
  const [orderType, setOrderType] = useState("00");

  const validateForm = (): string | null => {
    if (!startDate || !endDate) return "조회 기간을 입력해주세요.";

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) return "시작일은 종료일보다 이전이어야 합니다.";

    // 1년 이상 조회 제한
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) return "조회 기간은 1년 이내로 제한됩니다.";

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      addError({
        message: validationError,
        severity: "warning",
      });
      return;
    }

    const request: OrderExecutionInquiryRequest = {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
      stockCode: stockCode.trim() || undefined,
      orderType,
    };

    onSearch(request);
  };

  const handlePresetPeriod = (days: number) => {
    const today = getTodayString();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    const startDateString = pastDate.toISOString().split("T")[0];

    setStartDate(startDateString);
    setEndDate(today);
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
            type="button"
            onClick={() => handlePresetPeriod(7)}
            disabled={isLoading}
            className={styles.presetButton}
          >
            최근 1주일
          </button>
          <button
            type="button"
            onClick={() => handlePresetPeriod(30)}
            disabled={isLoading}
            className={styles.presetButton}
          >
            최근 1개월
          </button>
          <button
            type="button"
            onClick={() => handlePresetPeriod(90)}
            disabled={isLoading}
            className={styles.presetButton}
          >
            최근 3개월
          </button>
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
