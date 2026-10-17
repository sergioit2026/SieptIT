import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone/tablet on the same Wi-Fi to load /_next assets in dev
  allowedDevOrigins: [
    "192.168.1.222",
    "127.0.0.1",
    "localhost",
  ],
  // Modo demonstração: nunca indexar nem guardar em cache.
  async headers() {
    return [
      {
        source: "/demonstracao/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/demonstracao",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
