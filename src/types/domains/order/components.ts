import { OrderExecution, OrderExecutionInquiryRequest } from "./entities";

export interface SummaryCardItem {
  title: string;
  value: string;
}

export interface StockOrderFormProps {
  initialData?: {
    stockCode?: string;
    orderPrice?: number;
    maxQuantity?: number;
  };
  selectedStockCode?: string;
  onOrderSuccess?: () => void;
}

export interface OrderExecutionSearchFormProps {
  onSearch: (request: OrderExecutionInquiryRequest) => void;
  isLoading: boolean;
}

export interface OrderExecutionTableProps {
  items: OrderExecution[];
  isLoading: boolean;
}

export interface OrderExecutionViewProps {
  className?: string;
}
