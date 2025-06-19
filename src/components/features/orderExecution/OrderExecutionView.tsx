import React, { useEffect } from "react";
import { useOrderExecution } from "@/hooks/orderExecution/useOrderExecution";
import OrderExecutionSearchForm from "./OrderExecutionSearchForm";
import OrderExecutionTable from "./OrderExecutionTable";
import { useOrderExecutionDefaults } from "@/hooks/orderExecution/useOrderExecutionDefaults";
import styles from "./OrderExecutionView.module.css";

const OrderExecutionView: React.FC = () => {
  const { data, isLoading, fetchOrderExecutions } = useOrderExecution();
  const { defaultSearchRequest } = useOrderExecutionDefaults();

  useEffect(() => {
    fetchOrderExecutions(defaultSearchRequest);
  }, [fetchOrderExecutions, defaultSearchRequest]);

  return (
    <div className={styles.orderExecutionView}>
      <OrderExecutionSearchForm
        onSearch={fetchOrderExecutions}
        isLoading={isLoading}
      />

      {data && (
        <OrderExecutionTable items={data.executions} isLoading={isLoading} />
      )}
    </div>
  );
};

export default OrderExecutionView;
