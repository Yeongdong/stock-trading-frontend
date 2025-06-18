import { BuyableInquiryData } from "./entities";

export interface BuyableInquiryResultProps {
  data: BuyableInquiryData;
  onOrderClick: (stockCode: string, price: number, maxQuantity: number) => void;
}
