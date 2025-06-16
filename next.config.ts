import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nft.unchainedelephants.com",
        port: "",
        pathname: "/wp-content/uploads/2025/04/Your-paragraph-text-5-scaled.png"
      }
    ]
  }
};

export default nextConfig;
