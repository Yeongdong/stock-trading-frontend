import { useEffect, useState } from "react";
import { StockOrder } from "@/types";
import toast from "@/utils/toast";

export default function DashboardPage() {
  const [acntPrdtCd, setAcntPrdtCd] = useState<string>("00");
  const [pdno, setPdno] = useState<string>("00");
  const [orderDvsn, setOrderDvsn] = useState<"buy" | "sell">("buy");
  const [ordQty, setOrdQty] = useState<string>("");
  const [ordUnpr, setOrdUnpr] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = sessionStorage.getItem("access_token");

        if (!accessToken) {
          window.location.href = "/login";
          return;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleOrder = () => {
    const orderData: StockOrder = {
      acntPrdtCd,
      pdno,
      orderDvsn,
      ordQty,
      ordUnpr,
    };

    toast.confirm(toast.createOrderConfirmMsg(orderData), {
      onConfirm: async () => {
        try {
          setIsLoading(false);

          const accessToken = sessionStorage.getItem("access_token");

          const response = await fetch(
            "https://localhost:7072/api/stock/order",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(orderData),
            }
          );

          if (!response) {
            throw new Error("주문 처리 중 오류 발생");
          }

          setPdno("");
          setOrderDvsn("buy");
          setOrdQty("");
          setOrdUnpr("");
        } catch (error) {
          console.error("Error submitting order: ", error);
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="container">
      <h1>주식 주문</h1>
      <div>
        <label>주문 구분</label>
        <div>
          <input type="radio" value="buy" id="buy" />
          <label>매수</label>
        </div>
        <div>
          <input type="radio" value="sell" />
          <label>매도</label>
        </div>
        <div>
          <label>주문 수량</label>
          <input type="number" min="1" />
        </div>
        <div>
          <label>주문 구분</label>
          <select>
            <option>00: 지정가</option>
            <option>01 : 시장가</option>
            <option>02 : 조건부지정가</option>
            <option>03 : 최유리지정가</option>
            <option>04 : 최우선지정가</option>
            <option>05 : 장전 시간외 (08:20~08:40)</option>
            <option>06 : 장후 시간외 (15:30~16:00)</option>
            <option>07 : 시간외 단일가(16:00~18:00)</option>
            <option>08 : 자기주식</option>
            <option>09 : 자기주식S-Option</option>
            <option>10 : 자기주식금전신탁</option>
            <option>11 : IOC지정가 (즉시체결,잔량취소)</option>
            <option>12 : FOK지정가 (즉시체결,전량취소)</option>
            <option>13 : IOC시장가 (즉시체결,잔량취소)</option>
            <option>14 : FOK시장가 (즉시체결,전량취소)</option>
            <option>15 : IOC최유리 (즉시체결,잔량취소)</option>
            <option>16 : FOK최유리 (즉시체결,전량취소)</option>
          </select>
        </div>
        <div>
          <label>주문 가격</label>
          <input type="number" min="0" />
        </div>
        <button onClick={handleOrder} disabled={isLoading}>
          주문
        </button>
      </div>
    </div>
  );
}
