import type { NextConfig } from "next";

const nextConfig = {
  // Required for Capacitor - generates static files in /out
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
} satisfies NextConfig;

export default nextConfig;
