/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export', // enable static export
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/thebottlestories' : '',
  assetPrefix: isProd ? '/thebottlestories/' : '',
}

module.exports = nextConfig
