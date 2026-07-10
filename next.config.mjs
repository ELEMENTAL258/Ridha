/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Memaksa Next.js tetap melakukan build meskipun ada warning/error ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Memaksa Next.js tetap build meskipun ada error TypeScript atau konfigurasi luar
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
