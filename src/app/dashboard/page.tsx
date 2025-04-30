"use client";

import { useEffect, useState } from "react";
import { StockOrder } from "@/types";
import toast from "@/utils/toast";

export default function DashboardPage() {
  const [acntPrdtCd, setAcntPrdtCd] = useState<string>("01");
  const [trId, setTrId] = useState<string>("VTTC0802U");
  const [pdno, setPdno] = useState<string>("");
  const [ordDvsn, setOrderDvsn] = useState<string>("00: 지정가");
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

          const accessToken = sessionStorage.getItem("access_token");
          console.log(orderData);

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

          if (!response.ok) {
            throw new Error("주문 처리 중 오류 발생");
          }

          setTrId("VTTC0802U");
          setPdno("");
          setOrderDvsn("00: 지정가");
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
      <fieldset>
        <legend>주식 주문</legend>
        <div>
          <label>거래 구분</label>
          <input
            type="radio"
            name="trId"
            value="VTTC0802U"
            id="buy"
            onChange={(e) => setTrId(e.target.value)}
          />
          매수
          <input
            type="radio"
            name="trId"
            value="VTTC0801U"
            id="sell"
            onChange={(e) => setTrId(e.target.value)}
          />
          매도
          <div>
            <label>주문 종목</label>
            <input
              type="text"
              value={pdno}
              onChange={(e) => setPdno(e.target.value)}
            />
          </div>
          <div>
            <label>주문 수량</label>
            <input
              type="number"
              min="1"
              value={ordQty}
              onChange={(e) => setOrdQty(e.target.value)}
            />
          </div>
          <div>
            <label>주문 구분</label>
            <select
              value={ordDvsn}
              onChange={(e) => setOrderDvsn(e.target.value)}
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
          <div>
            <label>주문 단가</label>
            <input
              type="number"
              min="0"
              value={ordUnpr}
              onChange={(e) => setOrdUnpr(e.target.value)}
            />
          </div>
          <button onClick={handleOrder} disabled={isLoading}>
            주문
          </button>
        </div>
      </fieldset>
    </div>
  );
}
