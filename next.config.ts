import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  eslint: {
    // Skip ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
