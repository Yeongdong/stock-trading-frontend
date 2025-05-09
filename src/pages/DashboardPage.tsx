import { useEffect } from "react";
import StockOrderForm from "@/components/features/stock/StockOrderForm";
import { STORAGE_KEYS } from "@/constants/auth";

export default function DashboardPage() {
  useEffect(() => {
    const checkAuth = () => {
      const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!accessToken) {
        window.location.href = "/login";
        return;
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="container">
      <h1>대시보드</h1>
      <StockOrderForm />
    </div>
  );
}
