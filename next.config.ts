import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverExternalPackages: ['bcryptjs', '@prisma/client', '@prisma/adapter-neon', '@neondatabase/serverless', 'ws'],
  },
};

export default nextConfig;
