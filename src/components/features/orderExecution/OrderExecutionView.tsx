import React, { useEffect } from "react";
import { useOrderExecution } from "@/hooks/orderExecution/useOrderExecution";
import { OrderExecutionViewProps } from "@/types/components/orderExecution";
import { OrderExecutionInquiryRequest } from "@/types/order/execution";
import OrderExecutionSearchForm from "./OrderExecutionSearchForm";
import OrderExecutionTable from "./OrderExecutionTable";

const createDefaultSearchRequest = (): OrderExecutionInquiryRequest => {
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const get30DaysAgoString = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  };

  const formatDate = (date: string) => date.replace(/-/g, "");

  return {
    startDate: formatDate(get30DaysAgoString()),
    endDate: formatDate(getTodayString()),
    orderType: "00",
  };
};

const OrderExecutionView: React.FC<OrderExecutionViewProps> = ({
  className = "",
}) => {
  const { data, isLoading, fetchOrderExecutions } = useOrderExecution();

  useEffect(() => {
    const defaultRequest = createDefaultSearchRequest();
    fetchOrderExecutions(defaultRequest);
  }, [fetchOrderExecutions]);

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
