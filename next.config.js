/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desactiva ESLint durante el build de producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desactiva errores de TypeScript durante el build (opcional)
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['picsum.photos', 'localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
