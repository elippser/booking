import type { NextConfig } from "next";

const RESERVAS_BASE = "/reservas";

const nextConfig: NextConfig = {
  basePath: RESERVAS_BASE,
  assetPrefix: `${RESERVAS_BASE}-static`,
  async redirects() {
    return [
      {
        source: "/",
        destination: RESERVAS_BASE,
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
