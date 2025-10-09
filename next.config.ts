import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  turbopack: {
    // place turbopack config here if needed
  },
  reactStrictMode: true,
  // Enable standalone output for Docker
  output: 'standalone',
};

export default nextConfig;
