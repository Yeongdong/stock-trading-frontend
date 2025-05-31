"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/common/AuthGuard";
import Header from "@/components/layout/Header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="auth-layout">
          <Header />
          <main className="main-content">{children}</main>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
