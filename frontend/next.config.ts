import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // YouTube thumbnails
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      // SoundCloud
      { protocol: "https", hostname: "i1.sndcdn.com" },
      { protocol: "https", hostname: "i2.sndcdn.com" },
      { protocol: "https", hostname: "i3.sndcdn.com" },
      { protocol: "https", hostname: "i4.sndcdn.com" },
      // Bilibili
      { protocol: "https", hostname: "i0.hdslb.com" },
      { protocol: "https", hostname: "i1.hdslb.com" },
      { protocol: "https", hostname: "i2.hdslb.com" },
      // Generic / catch-all for other yt-dlp platforms
      { protocol: "https", hostname: "**" },
    ],
  },
  // Silence the x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
