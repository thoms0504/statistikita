/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/google/callback',
        destination: '/auth/google/callback',
      },
    ];
  },
};

module.exports = nextConfig;
