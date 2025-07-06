/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configure for static export to work with Render
  output: 'export',
  trailingSlash: true,
  
  // Environment variables that should be available to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Disable server-side features for static export
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 