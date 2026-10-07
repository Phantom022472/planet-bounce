import type { NextConfig } from "next";

// For now the site is plain static files (hosted free on GitHub Pages).
// BASE_PATH is set by the deploy workflow when the site lives under /planet-bounce.
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
