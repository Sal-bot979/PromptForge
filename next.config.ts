import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode for catching potential issues early
  reactStrictMode: true,

  // Server-side packages that should not be bundled for client
  serverExternalPackages: ['@anthropic-ai/sdk'],

  // Image optimization: allow Supabase storage domain
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Partial pre-rendering for faster initial loads
    ppr: false,
  },
}

export default nextConfig
