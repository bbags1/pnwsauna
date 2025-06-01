/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pnwsauna.com',
      },
    ],
  },
};

module.exports = nextConfig; 