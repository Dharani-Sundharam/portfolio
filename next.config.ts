import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Fully static site (no server needed) → deployable as a Render Static Site.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
