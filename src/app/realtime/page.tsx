"use client";

import { useEffect } from "react";
import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";
import { STORAGE_KEYS } from "@/constants/auth";
import { redirect } from "next/navigation";

export default function RealtimePage() {
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!token) {
        redirect("/login");
      }
    };

    checkAuth();
  }, []);

  return <RealtimeDashboard />;
}
