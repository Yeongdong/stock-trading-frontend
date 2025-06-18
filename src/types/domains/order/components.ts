import { OrderExecutionInquiryRequest } from "./entities";

export interface OrderExecutionSearchFormProps {
  onSearch: (request: OrderExecutionInquiryRequest) => void;
  isLoading: boolean;
}
