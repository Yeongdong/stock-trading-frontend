"use client";

import AuthGuard from "@/components/common/AuthGuard";
import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";

export default function RealtimePage() {
  return (
    <AuthGuard>
      <RealtimeDashboard />
    </AuthGuard>
  );
}
