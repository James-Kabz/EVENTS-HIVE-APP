import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["admin.ticketsasa.com", "another-domain.com", "cdn.example.org"],
  },
};

export default nextConfig;