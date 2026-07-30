/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "basemaps.cartocdn.com" },
      { protocol: "https", hostname: "a.basemaps.cartocdn.com" },
      { protocol: "https", hostname: "b.basemaps.cartocdn.com" },
      { protocol: "https", hostname: "c.basemaps.cartocdn.com" },
    ],
  },
}

export default nextConfig
