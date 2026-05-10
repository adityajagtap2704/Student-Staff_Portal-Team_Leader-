/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 120,
  experimental: {
    isrMemoryCacheSize: 0,
  },
};

export default nextConfig;
