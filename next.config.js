/** @type {import('next').NextConfig} */
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHost;
try {
  supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;
} catch {
  supabaseHost = null;
}

const nextConfig = {
  // Multiple lockfiles (e.g. parent ~/package-lock.json) can make Next infer the wrong root;
  // without this, `public/` may not resolve and local images 404 in dev/build.
  turbopack: {
    root: path.join(__dirname)
  },
  /** Align with [adesignline.com](https://www.adesignline.com/) `/p/...` style paths — `/pages/about` → `app/[page]` as `/about`. */
  async rewrites() {
    return [{ source: '/pages/:page', destination: '/:page' }];
  },
  images: {
    qualities: [75, 85, 90, 92, 95, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 's3.distributorcentral.com'
      },
      ...(supabaseHost
        ? [
            {
              protocol: 'https',
              hostname: supabaseHost
            }
          ]
        : [])
    ]
  }
};

module.exports = nextConfig;
