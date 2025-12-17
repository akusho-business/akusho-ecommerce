/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow placeholder images for development
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Unoptimized for static export if needed
    // unoptimized: true,
  },
  // Enable strict mode for better debugging
  reactStrictMode: true,
};

export default nextConfig;
