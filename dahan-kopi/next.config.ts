import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Project ini berdiri sendiri di dalam repo yang lebih besar; kunci root ke folder ini.
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
  // Halaman menu lama dipindah: menu kafe kini berupa PDF di halaman Lokasi.
  async redirects() {
    return [{ source: "/menu", destination: "/lokasi", permanent: true }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
