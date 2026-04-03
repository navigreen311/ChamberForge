/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  env: { NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000' },
  images: { domains: ['localhost'] },
}
module.exports = nextConfig
