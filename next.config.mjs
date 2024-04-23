/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'voit.dev',
        port: '',
        pathname: '/',
      },
    ],
  }
};

export default nextConfig;
