"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/ui/AuthGuard";
import Layout from "@/components/layout/Layout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard
        redirectPath="/login?sessionExpired=true"
        loadingMessage="사용자 인증 중..."
      >
        <Layout>{children}</Layout>
      </AuthGuard>
    </AuthProvider>
  );
}
