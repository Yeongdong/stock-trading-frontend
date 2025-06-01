import { BuyableInquiryResponse } from "../trading/buyable";

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
}
