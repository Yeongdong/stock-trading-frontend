import {
  BuyableInquiryResponse,
  OrderExecution,
  OrderExecutionInquiryRequest,
} from "./entities";

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

export interface BuyableInquiryFormProps {
  onResult?: (data: BuyableInquiryResponse) => void;
  initialStockCode?: string;
  initialOrderPrice?: number;
}

export interface BuyableInquiryResultProps {
  data: BuyableInquiryResponse;
  onOrderClick?: (stockCode: string, maxQuantity: number) => void;
}

export interface BuyableInquiryViewProps {
  className?: string;
  selectedStockCode?: string;
}
