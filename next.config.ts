/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 개발 환경에서만 오류 무시 (운영 빌드 시 품질 보장)
  ...(process.env.NODE_ENV === "development" && {
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
  }),

  // 성능 최적화
  experimental: {
    optimizeCss: true,
  },

  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 운영환경에서만 프록시 사용
  ...(process.env.NODE_ENV === "production" && {
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination:
            "https://stocktrading-api-f8hnhzhzbhbycsf3.koreacentral-01.azurewebsites.net/api/:path*",
        },
      ];
    },
  }),
};

module.exports = nextConfig;
