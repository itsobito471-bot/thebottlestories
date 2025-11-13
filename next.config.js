/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export', // enables static export for GitHub Pages
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  basePath: isProd ? '/thebottlestories' : '',
  assetPrefix: isProd ? '/thebottlestories/' : '',
};

module.exports = nextConfig;
