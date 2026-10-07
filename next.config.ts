import type { NextConfig } from "next";

// For now the site is plain static files (hosted free on GitHub Pages).
// BASE_PATH is set by the deploy workflow when the site lives under /planet-bounce.
const basePath = process.env.BASE_PATH || "";
// Changes on every deploy, so open pages can tell a newer version is live.
const buildId = (process.env.GITHUB_SHA || String(Date.now())).slice(0, 12);

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // emit book/index.html so /book/ works on GitHub Pages
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_BUILD_ID: buildId },
};

export default nextConfig;
