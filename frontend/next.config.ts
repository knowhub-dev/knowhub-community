import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  turbopack: {
    // Ensure Turbopack uses the correct workspace root (frontend project root)
    // Using the project root helps Turbopack resolve app/ and node_modules correctly.
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'knowhub.uz',
      },
      {
        protocol: 'https',
        hostname: '*.knowhub.uz',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
