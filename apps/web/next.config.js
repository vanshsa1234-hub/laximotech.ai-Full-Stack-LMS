/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Explicitly pin the monorepo root so Next.js never has to auto-detect it.
  // Without this, Next walks up looking for the workspace root and can trigger
  // a package-manager probe that throws ENOWORKSPACES on some npm versions —
  // this setting removes that guesswork entirely.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.laximotech.ai' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com' }, // any bucket/region, covers the S3 fallback URL
      { protocol: 'http',  hostname: 'localhost', port: '4000' }, // local uploads server (dev only)
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['laximotech.ai', 'localhost:3000'] },
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options',       value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};

module.exports = nextConfig;
