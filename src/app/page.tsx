"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 추후 홈페이지 메인 화면 추가시 조건부 로직 추가
    router.replace("/login");
  }, [router]);

  return null;
}
