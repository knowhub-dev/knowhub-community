import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  turbopack: {
    // Ensure Turbopack uses the correct workspace root (frontend project root)
    // Using the project root helps Turbopack resolve app/ and node_modules correctly.
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
