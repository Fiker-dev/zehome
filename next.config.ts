import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // CJdropshipping product photos (our CJ-supplied products link to them directly)
    remotePatterns: [
      new URL("https://cf.cjdropshipping.com/**"),
      new URL("https://oss-cf.cjdropshipping.com/**"),
    ],
  },
};

export default nextConfig;
