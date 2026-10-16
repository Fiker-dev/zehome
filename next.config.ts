import type { NextConfig } from "next";

// Browser security headers for every page. No script-src CSP: Next.js inlines
// scripts and a strict policy would need nonces; frame-ancestors/base-uri/
// object-src still block clickjacking and base-tag or plugin injection.
// form-action is left open so PayFast's checkout redirects are never blocked.
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  poweredByHeader: false,
  // Old Shopify-era URLs (still in Google's index) and products the owner has
  // retired go to the shop instead of a 404.
  async redirects() {
    return [
      { source: "/products/:path*", destination: "/shop", permanent: true },
      { source: "/collections/all", destination: "/shop", permanent: true },
      { source: "/collections/glassware-drinkware", destination: "/shop", permanent: true },
      { source: "/collections/home-fragrance-decor", destination: "/collections/home-fragrance", permanent: true },
      { source: "/collections/home-decor", destination: "/shop", permanent: true },
      { source: "/product/mushroom-salt-lamp", destination: "/shop", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
