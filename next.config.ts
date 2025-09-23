import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      rules: {},
    },
  },
  // Configuración del servidor de desarrollo
  async rewrites() {
    return [];
  },
};

export default nextConfig;
