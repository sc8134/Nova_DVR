import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "1000+ Sites You Can Download From Using Nova DVR — 2025",
  description: "The complete list of platforms supported by Nova DVR — from YouTube to niche streaming sites.",
};

const CATEGORIES = [
  {
    name: "Video Platforms",
    sites: ["YouTube", "Vimeo", "Dailymotion", "Rumble", "Odysee", "Bilibili", "Niconico", "Youku", "Naver TV", "AbemaTV"],
  },
  {
    name: "Social Media",
    sites: ["Instagram", "TikTok", "Facebook", "X (Twitter)", "Reddit", "Pinterest", "Snapchat", "LinkedIn", "VK", "Weibo"],
  },
  {
    name: "Music & Audio",
    sites: ["SoundCloud", "Bandcamp", "Mixcloud", "Spotify*", "Apple Music*", "Deezer*"],
  },
  {
    name: "Live Streaming",
    sites: ["Twitch (VODs)", "YouTube Live (after stream)", "Streamable", "Loom"],
  },
  {
    name: "News & Entertainment",
    sites: ["BBC iPlayer", "CNN", "NBC", "CBS", "Fox News", "ESPN", "Crunchyroll", "Funimation"],
  },
  {
    name: "Cloud Storage",
    sites: ["Google Drive", "Dropbox"],
  },
];

export default function Post() {
  return (
    <article className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">← Back to Blog</Link>
      <header className="space-y-4">
        <span className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold px-3 py-1 rounded-full">Reference</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">1000+ Sites You Can Download From Using Nova DVR</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">June 2025 · 2 min read</p>
      </header>
      <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p className="text-base">Nova DVR is powered by <strong>yt-dlp</strong> — the most comprehensive open-source media extractor available. It supports over 1000 websites out of the box. Here&apos;s a breakdown by category.</p>

        <div className="space-y-5">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{cat.name}</h2>
              <div className="flex flex-wrap gap-2">
                {cat.sites.map((site) => (
                  <span key={site} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                    {site}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          * Spotify, Apple Music and Deezer support metadata and podcast episodes only — not DRM-protected tracks.
        </p>

        <p>For the complete list of all supported extractors, see the <a href="https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">yt-dlp supported sites page</a>.</p>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
          <p className="font-semibold text-amber-800 dark:text-amber-200">Can&apos;t find your site?</p>
          <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">Just paste any video URL into the downloader — if yt-dlp supports it, Nova DVR will detect it automatically.</p>
          <Link href="/" className="inline-block mt-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">Try a URL →</Link>
        </div>
      </div>
    </article>
  );
}
