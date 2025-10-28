/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['maplibre-gl']
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'maplibre-gl': 'maplibre-gl/dist/maplibre-gl.js'
    }
    return config
  },
  // Excluir carpetas antiguas del build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    dirs: ['src', 'app'],
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
