import { useState, useEffect } from "react";
import { StockOrder, BuyableInquiryResponse } from "@/types";
import toast from "@/utils/toast";
import { API, ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import BuyableInquiryForm from "../trading/BuyableInquiryForm";
import BuyableInquiryResult from "../trading/BuyableInquiryResult";
import styles from "./StockOrderForm.module.css";

interface EnhancedStockOrderFormProps {
  initialData?: {
    stockCode?: string;
    orderPrice?: number;
    maxQuantity?: number;
  };
}

const EnhancedStockOrderForm: React.FC<EnhancedStockOrderFormProps> = ({
  initialData,
}) => {
  const [acntPrdtCd] = useState<string>("01");
  const [trId, setTrId] = useState<string>("VTTC0802U");
  const [pdno, setPdno] = useState<string>(initialData?.stockCode || "");
  const [ordDvsn, setOrderDvsn] = useState<string>("00: 지정가");
  const [ordQty, setOrdQty] = useState<string>("");
  const [ordUnpr, setOrdUnpr] = useState<string>(
    initialData?.orderPrice?.toString() || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showBuyableInquiry, setShowBuyableInquiry] = useState(false);
  const [buyableData, setBuyableData] = useState<BuyableInquiryResponse | null>(
    null
  );

  const { addError } = useError();

  // initialData가 변경되면 폼 업데이트
  useEffect(() => {
    if (initialData?.stockCode) setPdno(initialData.stockCode);
    if (initialData?.orderPrice) setOrdUnpr(initialData.orderPrice.toString());
  }, [initialData]);

  const validateOrder = () => {
    if (!pdno) {
      addError({
        message: ERROR_MESSAGES.ORDER.INVALID_SYMBOL,
        severity: "warning",
      });
      return false;
    }

    if (!ordQty || parseInt(ordQty) <= 0) {
      addError({
        message: ERROR_MESSAGES.ORDER.INVALID_QUANTITY,
        severity: "warning",
      });
      return false;
    }

    if (ordDvsn.startsWith("00") && (!ordUnpr || parseInt(ordUnpr) <= 0)) {
      addError({
        message: ERROR_MESSAGES.ORDER.INVALID_PRICE,
        severity: "warning",
      });
      return false;
    }

    return true;
  };

  const handleOrder = () => {
    if (!validateOrder()) return;

    const processedOrderDvsn = ordDvsn.substring(0, 2);
    const orderData: StockOrder = {
      acntPrdtCd,
      trId,
      pdno,
      ordDvsn: processedOrderDvsn,
      ordQty,
      ordUnpr,
    };

    toast.confirm(toast.createOrderConfirmMsg(orderData), {
      onConfirm: async () => {
        try {
          setIsLoading(true);

          const response = await apiClient.post(API.STOCK.ORDER, orderData, {
            requiresAuth: true,
            handleError: true,
          });

          if (response.error) {
            throw new Error(response.error);
          }

          addError({
            message: ERROR_MESSAGES.ORDER.ORDER_SUCCESS,
            severity: "info",
          });

          // 주문 성공 후 폼 초기화
          setTrId("VTTC0802U");
          setPdno("");
          setOrderDvsn("00: 지정가");
          setOrdQty("");
          setOrdUnpr("");
          setBuyableData(null);
        } catch (error) {
          console.error("Error submitting order: ", error);
          if (error instanceof Error) {
            addError({
              message: error.message || ERROR_MESSAGES.ORDER.ORDER_FAILED,
              severity: "error",
            });
          }
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleBuyableInquiryResult = (data: BuyableInquiryResponse) => {
    setBuyableData(data);
    // 조회 결과를 주문 폼에 자동 입력
    setPdno(data.stockCode);
    setOrdUnpr(data.orderPrice.toString());
  };

  const handleOrderFromBuyable = (stockCode: string, maxQuantity: number) => {
    setPdno(stockCode);
    setOrdQty(maxQuantity.toString());
    setShowBuyableInquiry(false);

    addError({
      message: `주문 정보가 입력되었습니다. 수량을 조정 후 주문해주세요.`,
      severity: "info",
    });
  };

  return (
    <div className={styles.enhancedStockOrderForm}>
      <div className={styles.formHeader}>
        <h2>주식 주문</h2>
        <button
          type="button"
          onClick={() => setShowBuyableInquiry(!showBuyableInquiry)}
          className={styles.toggleInquiryBtn}
        >
          {showBuyableInquiry ? "매수가능조회 숨기기" : "매수가능조회"}
        </button>
      </div>

      {/* 매수가능조회 섹션 */}
      {showBuyableInquiry && (
        <div className={styles.buyableInquirySection}>
          <BuyableInquiryForm
            onResult={handleBuyableInquiryResult}
            initialStockCode={pdno}
            initialOrderPrice={parseInt(ordUnpr) || 0}
          />

          {buyableData && (
            <BuyableInquiryResult
              data={buyableData}
              onOrderClick={handleOrderFromBuyable}
            />
          )}
        </div>
      )}

      {/* 기존 주문 폼 */}
      <fieldset className={styles.fieldset}>
        <legend>주문 정보</legend>

        <div className={styles.formGroup}>
          <label>거래 구분</label>
          <div className={styles.radioGroup}>
            <input
              type="radio"
              name="trId"
              value="VTTC0802U"
              id="buy"
              checked={trId === "VTTC0802U"}
              onChange={(e) => setTrId(e.target.value)}
            />
            <label htmlFor="buy">매수</label>
            <input
              type="radio"
              name="trId"
              value="VTTC0801U"
              id="sell"
              checked={trId === "VTTC0801U"}
              onChange={(e) => setTrId(e.target.value)}
            />
            <label htmlFor="sell">매도</label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>주문 종목</label>
          <input
            type="text"
            value={pdno}
            onChange={(e) => setPdno(e.target.value)}
            placeholder="종목코드 (6자리)"
            maxLength={6}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>주문 수량</label>
          <input
            type="number"
            min="1"
            value={ordQty}
            onChange={(e) => setOrdQty(e.target.value)}
            placeholder="주문 수량"
            className={styles.input}
          />
          {buyableData && (
            <small className={styles.helperText}>
              최대 매수가능: {buyableData.buyableQuantity.toLocaleString()}주
            </small>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>주문 구분</label>
          <select
            value={ordDvsn}
            onChange={(e) => setOrderDvsn(e.target.value)}
            className={styles.select}
          >
            <option>00: 지정가</option>
            <option>01: 시장가</option>
            <option>02: 조건부지정가</option>
            <option>03: 최유리지정가</option>
            <option>04: 최우선지정가</option>
            <option>05: 장전 시간외 (08:20~08:40)</option>
            <option>06: 장후 시간외 (15:30~16:00)</option>
            <option>07: 시간외 단일가(16:00~18:00)</option>
            <option>08: 자기주식</option>
            <option>09: 자기주식S-Option</option>
            <option>10: 자기주식금전신탁</option>
            <option>11: IOC지정가 (즉시체결,잔량취소)</option>
            <option>12: FOK지정가 (즉시체결,전량취소)</option>
            <option>13: IOC시장가 (즉시체결,잔량취소)</option>
            <option>14: FOK시장가 (즉시체결,전량취소)</option>
            <option>15: IOC최유리 (즉시체결,잔량취소)</option>
            <option>16: FOK최유리 (즉시체결,전량취소)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>주문 단가</label>
          <input
            type="number"
            min="0"
            value={ordUnpr}
            onChange={(e) => setOrdUnpr(e.target.value)}
            placeholder="주문 단가"
            className={styles.input}
          />
          {buyableData && (
            <small className={styles.helperText}>
              현재가: {buyableData.currentPrice.toLocaleString()}원
            </small>
          )}
        </div>

        <button
          onClick={handleOrder}
          disabled={isLoading}
          className={styles.orderButton}
        >
          {isLoading ? "주문 중..." : "주문"}
        </button>
      </fieldset>
    </div>
  );
};

export default EnhancedStockOrderForm;
