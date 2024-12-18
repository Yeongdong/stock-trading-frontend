'use client';

import React from 'react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

export function AuthCheck({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const verify = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        router.push('/login');
      }
    };

    verify();
  }, [checkAuth, router]);

  return <>{children}</>;
}