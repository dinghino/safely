import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: [
    "@workspace/ui",
    "@workspace/react-utils",
    "@workspace/nuqs",
    "@workspace/data-table",
    "@workspace/backend"
  ],
}

export default nextConfig
