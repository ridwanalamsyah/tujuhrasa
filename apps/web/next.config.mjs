/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ERP statis di /erp (disalin dari apps/erp oleh scripts/copy-erp.mjs).
  async headers() {
    return [
      {
        source: "/erp/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/erp/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          // Halaman ERP ada di /erp (di luar folder /erp/ tempat sw.js).
          { key: "Service-Worker-Allowed", value: "/erp" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    }
  }
};

export default nextConfig;
