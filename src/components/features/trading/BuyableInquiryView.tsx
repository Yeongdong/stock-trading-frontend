import React, { useState } from "react";
import BuyableInquiryForm from "./BuyableInquiryForm";
import BuyableInquiryResult from "./BuyableInquiryResult";
import { BuyableInquiryResponse, BuyableInquiryViewProps } from "@/types";

const BuyableInquiryView: React.FC<BuyableInquiryViewProps> = ({
  className = "",
}) => {
  const [inquiryResult, setInquiryResult] =
    useState<BuyableInquiryResponse | null>(null);

  const handleInquiryResult = (data: BuyableInquiryResponse) => {
    setInquiryResult(data);
  };

  const handleOrderClick = (stockCode: string, maxQuantity: number) => {
    console.log("주문하기:", { stockCode, maxQuantity });

    // 실제로는 주문 폼 페이지로 이동하거나 모달을 띄울 예정
    alert(`${stockCode} 종목을 최대 ${maxQuantity}주까지 주문할 수 있습니다.`);
  };

  return (
    <div className={`buyable-inquiry-view ${className}`}>
      <BuyableInquiryForm onResult={handleInquiryResult} />

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
