import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cards.scryfall.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "c1.scryfall.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
