import React, { useState } from "react";
import BuyableInquiryForm from "./BuyableInquiryForm";
import BuyableInquiryResult from "./BuyableInquiryResult";
import { BuyableInquiryResponse, BuyableInquiryViewProps } from "@/types";

const BuyableInquiryView: React.FC<BuyableInquiryViewProps> = ({
  className = "",
  selectedStockCode = "",
}) => {
  const [inquiryResult, setInquiryResult] =
    useState<BuyableInquiryResponse | null>(null);

  const handleInquiryResult = (data: BuyableInquiryResponse) => {
    setInquiryResult(data);
  };

  const handleOrderClick = (stockCode: string, maxQuantity: number) => {
    alert(`${stockCode} 종목을 최대 ${maxQuantity}주까지 주문할 수 있습니다.`);
  };

  return (
    <div className={`buyable-inquiry-view ${className}`}>
      <BuyableInquiryForm
        onResult={handleInquiryResult}
        initialStockCode={selectedStockCode}
      />

      {inquiryResult && (
        <BuyableInquiryResult
          data={inquiryResult}
          onOrderClick={handleOrderClick}
        />
      )}
    </div>
  );
};

export default BuyableInquiryView;
