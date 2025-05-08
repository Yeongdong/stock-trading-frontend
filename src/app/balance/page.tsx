"use client";

import { useState, useEffect } from "react";
import { StockBalance } from "@/types";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { PositionsTable } from "@/components/ui/PositionsTable";
import { API, STORAGE_KEYS } from "@/constants";

export default function BalancePage() {
  const [balanceData, setBalanceData] = useState<StockBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalanceData = async () => {
    try {
      setIsLoading(true);
      const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      const response = await fetch(API.STOCK.BALANCE, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application-json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch balance data");
      }
      const data = await response.json();
      setBalanceData(data);
      console.log(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occured");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>주식 잔고 현황</h1>
      <button onClick={fetchBalanceData}>새로고침</button>
      <SummaryCard summary={balanceData!.summary} />
      <PositionsTable positions={balanceData!.positions} />
    </div>
  );
}
