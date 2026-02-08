import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tiwhnvpvtgeocxqyvlaf.supabase.co',
      },
    ],
  },
};

export default nextConfig;
