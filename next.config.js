/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pnwsauna.com',
      },
    ],
  },
  distDir: 'dist',
};

module.exports = nextConfig; 