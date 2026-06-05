/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Imágenes públicas del Storage de Supabase
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
