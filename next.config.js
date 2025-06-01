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
  // Disable certain features that might cause recursion
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/node_modules', '**/.next'],
    };
    return config;
  },
};

module.exports = nextConfig; 