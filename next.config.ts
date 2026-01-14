import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/organization-settings",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.CORS_ALLOWED_ORIGIN || "*",
          },
          { key: "Access-Control-Allow-Methods", value: "GET, PUT, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-API-Key, Content-Type",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
