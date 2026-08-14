/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Required for App Router
  },
  // Ensure API routes can access env
  env: {
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_EXPLORER: process.env.NEXT_PUBLIC_EXPLORER,
  },
};

module.exports = nextConfig;
