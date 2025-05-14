"use client";

import { useEffect } from "react";
import StockOrderForm from "@/components/features/stock/StockOrderForm";
import { STORAGE_KEYS } from "@/constants/auth";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  useEffect(() => {
    const checkAuth = () => {
      const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!accessToken) {
        redirect("/login");
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
