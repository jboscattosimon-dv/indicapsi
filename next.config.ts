import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://open.spotify.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "frame-src 'self' https://open.spotify.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "media-src 'self' blob: https:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
