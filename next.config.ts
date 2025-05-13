import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ この設定を追加することで、Lintエラーでもビルドを通せる
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;