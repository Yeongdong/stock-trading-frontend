'use client';

import React from 'react';
import { Button } from '../ui/button';

export function LoginButton() {
  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`;
  };

  return (
    <Button onClick={handleLogin} className="w-full">
      Google로 로그인
    </Button>
  );
}