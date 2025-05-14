"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function HomePage() {
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    redirect("/login");
  }, []);

  // 서버 사이드에서는 빈 페이지 렌더링
  return null;
}
