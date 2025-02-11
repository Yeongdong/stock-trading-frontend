import { useState, useEffect } from "react";
import { StockBalance } from "@/types";
import { SummaryCards } from "@/components/ui/SummaryCard";
import { PositionsTable } from "@/components/ui/PositionsTable";

export const StockBalancePage = () => {
  const [balanceData, setBalanceData] = useState<StockBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalanceData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("api/stock/balance");
      if (!response.ok) {
        throw new Error("Failed to fetch balance data");
      }
      const data = await response.json();
      setBalanceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occured");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceData();
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!balanceData) {
    return <div>No data</div>;
  }

  return (
    <div>
      <h1>주식 잔고 현황</h1>
      <button onClick={fetchBalanceData}>새로고침</button>
      <SummaryCards summary={balanceData.summary} />
      <PositionsTable positions={balanceData.positions} />
    </div>
  );
};
