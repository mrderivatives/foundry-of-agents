import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'forge-of-agents.vercel.app' }],
        destination: 'https://agentforge.systems/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
