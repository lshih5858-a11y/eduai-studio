import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로덕션 빌드에서 타입 오류 차단
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint 오류 빌드 차단
  eslint: {
    ignoreDuringBuilds: false,
  },
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  },
};

export default nextConfig;
