import React, { useState } from "react";
import styles from "./OverseasOrderExecutionSearchForm.module.css";

interface OverseasOrderExecutionSearchFormProps {
  onSearch: (startDate: string, endDate: string) => void;
  isLoading: boolean;
}

const OverseasOrderExecutionSearchForm: React.FC<
  OverseasOrderExecutionSearchFormProps
> = ({ onSearch, isLoading }) => {
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
    const formattedStartDate = startDate.replace(/-/g, "");
    const formattedEndDate = endDate.replace(/-/g, "");

    onSearch(formattedStartDate, formattedEndDate);
  };

  return (
    <div className={styles.searchFormContainer}>
      <h3 className={styles.formTitle}>조회 조건</h3>

      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.formGroup}>
          <label htmlFor="startDate" className={styles.label}>
            시작일
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.dateInput}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="endDate" className={styles.label}>
            종료일
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.dateInput}
            required
          />
        </div>

        <button
          type="submit"
          className={styles.searchButton}
          disabled={isLoading}
        >
          {isLoading ? "조회 중..." : "조회"}
        </button>
      </form>
    </div>
  );
};

export default OverseasOrderExecutionSearchForm;
