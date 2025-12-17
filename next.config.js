/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["svsxsiwrlkrhxjtppgtb.supabase.co"],
    formats: ["image/avif", "image/webp"],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize for production
  swcMinify: true,
};

module.exports = nextConfig;
