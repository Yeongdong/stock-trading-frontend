import React from "react";
import { useOrderExecution } from "@/hooks/orderExecution/useOrderExecution";
import { OrderExecutionViewProps } from "@/types/components/orderExecution";
import OrderExecutionSearchForm from "./OrderExecutionSearchForm";
import OrderExecutionTable from "./OrderExecutionTable";

const OrderExecutionView: React.FC<OrderExecutionViewProps> = ({
  className = "",
}) => {
  const { data, isLoading, fetchOrderExecutions } = useOrderExecution();

  return (
    <div className={`order-execution-view ${className}`}>
      <OrderExecutionSearchForm
        onSearch={fetchOrderExecutions}
        isLoading={isLoading}
      />

      {data && (
        <OrderExecutionTable
          items={data.executionItems}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default OrderExecutionView;
