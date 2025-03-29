import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.ticketsasa.com",
      },
      {
        protocol: "https",
        hostname: "another-domain.com",
      },
      {
        protocol: "https",
        hostname: "cdn.example.org",
      },
    ],
  },
};

export default nextConfig;
