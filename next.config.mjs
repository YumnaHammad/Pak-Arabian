/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    /* AVIF/WebP are a large win on product photography, which is most of the
       page weight once the catalogue has real images. */
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  compiler: {
    /* Strip console.* in production, keeping errors and warnings. */
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  /*
   * NOTE: `experimental.optimizePackageImports` was tried here for
   * framer-motion / drei / recharts and had to be removed — it rewrites barrel
   * imports and produced a runtime 500 on every prerendered page. The bundle
   * saving was not worth an unstable build.
   */

  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
};

export default nextConfig;
