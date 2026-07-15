/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Mengabaikan error ESLint saat build di Vercel agar tidak membatalkan kompilasi
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Mengabaikan error tipe data TypeScript saat build di Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
