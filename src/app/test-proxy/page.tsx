// src/app/test-proxy/page.tsx (테스트용 임시 페이지)
"use client";

export default function TestProxyPage() {
  const testProxy = async () => {
    try {
      console.log("테스트 요청 시작: /api/Auth/check");

      const response = await fetch("/api/Auth/check", {
        method: "GET",
        credentials: "include",
      });

      console.log("응답 상태:", response.status);
      console.log("응답 URL:", response.url); // 실제 호출된 URL 확인

      const data = await response.text();
      console.log("응답 데이터:", data);
    } catch (error) {
      console.error("프록시 테스트 에러:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>프록시 테스트</h1>
      <button onClick={testProxy}>프록시 테스트 실행</button>
      <p>개발자 도구 Console과 Network 탭에서 결과 확인</p>
    </div>
  );
}
