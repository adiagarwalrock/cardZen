import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // SQLite and Node.js native modules are only available in server components
  serverExternalPackages: ['sqlite3', 'sqlite', 'better-sqlite3', 'bindings'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Configure webpack to handle Node.js modules appropriately
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to load fs or other Node.js modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        sqlite3: false,
        sqlite: false,
        'better-sqlite3': false,
        bindings: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
