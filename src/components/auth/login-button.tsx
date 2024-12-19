// components/auth/login-button.tsx
'use client';

import { Button } from "../ui/button";
import { signIn } from "next-auth/react";

export function LoginButton() {
  return (
    <Button
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      className="w-full"
    >
      Google로 로그인
    </Button>
  );
}