import React, { useEffect } from "react";
import { useOrderExecution } from "@/hooks/orderExecution/useOrderExecution";
import { useError } from "@/contexts/ErrorContext";
import { OrderExecutionInquiryRequest } from "@/types";
import OrderExecutionSearchForm from "./OrderExecutionSearchForm";
import OrderExecutionTable from "./OrderExecutionTable";
import styles from "./OrderExecutionView.module.css";

const OrderExecutionView: React.FC = () => {
  const { data, isLoading, fetchOrderExecutions } = useOrderExecution();
  const { addError } = useError();

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchOrderExecutions();
    };
    loadInitialData();
  }, [fetchOrderExecutions, addError]);

  // 검색 폼에서의 검색 처리
  const handleSearch = async (request: OrderExecutionInquiryRequest) => {
    await fetchOrderExecutions(request);
  };

  return (
    <div className={styles.orderExecutionView}>
      <OrderExecutionSearchForm onSearch={handleSearch} isLoading={isLoading} />

      {data && (
        <OrderExecutionTable items={data.executions} isLoading={isLoading} />
      )}
    </div>
  );
};

export default OrderExecutionView;
