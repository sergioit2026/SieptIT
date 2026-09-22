import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone/tablet on the same Wi-Fi to load /_next assets in dev
  allowedDevOrigins: [
    "192.168.1.222",
    "127.0.0.1",
    "localhost",
  ],
};

export default nextConfig;
