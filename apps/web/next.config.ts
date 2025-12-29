import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  allowedDevOrigins: [
    'http://localhost:3001',
    'http://192.168.0.10:3001',
    'https://lbg22w26-3001.euw.devtunnels.ms',
    'https://vb5hlq2k-3001.euw.devtunnels.ms/',
  ],
  transpilePackages: [
    '@workspace/ui',
    '@workspace/react-utils',
    '@workspace/data-filter',
    '@workspace/data-table',
    '@workspace/backend',
    '@workspace/nuqs',
    '@workspace/form',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.0.10', 'https://lbg22w26-3001.euw.devtunnels.ms'],
    },
  },
}

export default nextConfig
