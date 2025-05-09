import React, { useEffect } from "react";
import { STORAGE_KEYS } from "@/constants/auth";
import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";

const RealtimePage: React.FC = () => {
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!token) {
        window.location.href = "/login";
      }
    };

    checkAuth();
  }, []);

  return <RealtimeDashboard />;
};

export default RealtimePage;
