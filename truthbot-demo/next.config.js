/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase timeout for API routes (LLM calls can be slow)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
