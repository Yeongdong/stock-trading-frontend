import React, { useEffect } from "react";
import { useOverseasOrderExecution } from "@/hooks/stock/useOverseasOrderExecution";
import styles from "./OverseasOrderExecutionView.module.css";
import OverseasOrderExecutionSearchForm from "./OverseasOrderExecutionSearchForm";
import OverseasOrderExecutionTable from "./OverseasOrderExecutionTable";

const OverseasOrderExecutionView: React.FC = () => {
  const { executions, isLoading, error, fetchExecutions } =
    useOverseasOrderExecution();

  // 초기 데이터 로드 (최근 7일)
  useEffect(() => {
    const loadInitialData = async () => {
      const endDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");

      await fetchExecutions(startDate, endDate);
    };

    loadInitialData();
  }, [fetchExecutions]);

  const handleSearch = async (startDate: string, endDate: string) => {
    await fetchExecutions(startDate, endDate);
  };

  return (
    <div className={styles.overseasOrderExecutionView}>
      <OverseasOrderExecutionSearchForm
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {error && <div className={styles.errorMessage}>{error}</div>}

      <OverseasOrderExecutionTable
        executions={executions}
        isLoading={isLoading}
      />
    </div>
  );
};

export default OverseasOrderExecutionView;
