/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["livekit-server-sdk"],
  },
};

export default nextConfig;
