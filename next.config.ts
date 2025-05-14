/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  output: "standalone",

  // 컴파일 중 ESLint 오류를 경고로 처리
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 타입 체크 오류를 빌드 시 경고로 처리
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
