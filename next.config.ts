import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  output: "standalone",
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
