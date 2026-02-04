import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@mindforge/shared-types", "@mindforge/shared-utils"],
};

export default nextConfig;
