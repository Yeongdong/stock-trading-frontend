import {
  OrderExecutionInquiryRequest,
  OrderExecutionItem,
} from "../order/execution";

export interface OrderExecutionSearchFormProps {
  onSearch: (request: OrderExecutionInquiryRequest) => void;
  isLoading: boolean;
}

export interface OrderExecutionTableProps {
  items: OrderExecutionItem[];
  isLoading: boolean;
}

export interface OrderExecutionViewProps {
  className?: string;
}
