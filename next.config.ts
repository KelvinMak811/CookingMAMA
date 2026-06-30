import type { NextConfig } from "next";

/** GitHub Pages project site: kelvinmak811.github.io/CookingMAMA */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/CookingMAMA" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "www.themealdb.com",
      },
    ],
  },
};

export default nextConfig;
