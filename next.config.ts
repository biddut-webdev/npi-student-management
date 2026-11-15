import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // The app lives in a nested folder; pin the Turbopack root to the directory
  // where `next` is invoked so the parent workspace's lockfile is not picked up.
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
