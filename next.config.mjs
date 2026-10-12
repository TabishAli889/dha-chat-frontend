/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false, // hide the "N" badge shown during npm run dev
  images: {
    remotePatterns: [{ protocol: "https", hostname: "api.dhaconnects.com" }],
  },
};

export default nextConfig;
