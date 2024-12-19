// components/auth/auth-check.tsx
'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    redirect('/login');
  }

  return <>{children}</>;
}