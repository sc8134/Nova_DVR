import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nova DVR vs Y2Mate vs SSYouTube — Best Video Downloader 2025",
  description: "An honest comparison of the top online video downloaders in 2025. Supported sites, quality, batch support, privacy and speed.",
};

const TABLE = [
  { feature: "Supported sites",    nova: "1000+",   y2mate: "~20",    ss: "~15"    },
  { feature: "Max video quality",  nova: "4K",      y2mate: "1080p",  ss: "1080p"  },
  { feature: "MP3 extraction",     nova: "✅ 192kbps", y2mate: "✅",  ss: "✅"     },
  { feature: "Batch downloads",    nova: "✅",      y2mate: "❌",     ss: "❌"     },
  { feature: "Playlist support",   nova: "✅",      y2mate: "❌",     ss: "❌"     },
  { feature: "Subtitle download",  nova: "✅",      y2mate: "❌",     ss: "❌"     },
  { feature: "AI format picker",   nova: "✅",      y2mate: "❌",     ss: "❌"     },
  { feature: "Trim / clip",        nova: "✅",      y2mate: "❌",     ss: "❌"     },
  { feature: "No ads",             nova: "✅",      y2mate: "❌",     ss: "❌"     },
  { feature: "Open source",        nova: "✅",      y2mate: "❌",     ss: "❌"     },
  { feature: "Free tier",          nova: "5/day",   y2mate: "Unlimited", ss: "Unlimited" },
];

export default function Post() {
  return (
    <article className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Back to Blog
      </Link>

      <header className="space-y-4">
        <span className="inline-block bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold px-3 py-1 rounded-full">Comparison</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Nova DVR vs Y2Mate vs SSYouTube — Which Is Best in 2025?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">June 2025 · 6 min read</p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p className="text-base">
          There are dozens of online video downloaders, but most of them are built around a single use case: YouTube. Nova DVR was built differently — it supports 1000+ platforms, has a full batch system, and is completely open source. Here&apos;s how it stacks up against the two most popular alternatives.
        </p>

        {/* Comparison table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Feature</th>
                <th className="text-center px-4 py-3 font-bold text-blue-600 dark:text-blue-400">Nova DVR</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-500">Y2Mate</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-500">SSYouTube</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {TABLE.map((row) => (
                <tr key={row.feature} className="bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{row.feature}</td>
                  <td className="px-4 py-3 text-center font-semibold text-blue-600 dark:text-blue-400">{row.nova}</td>
                  <td className="px-4 py-3 text-center text-slate-500">{row.y2mate}</td>
                  <td className="px-4 py-3 text-center text-slate-500">{row.ss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-6">Y2Mate</h2>
        <p>Y2Mate is one of the oldest online YouTube downloaders. It works for basic YouTube downloads but is heavily ad-supported, supports very few platforms outside YouTube, and has no batch or playlist functionality. It also has a history of redirecting users to unwanted pages.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-6">SSYouTube (SaveFrom)</h2>
        <p>SSYouTube (also known as SaveFrom.net) is similar — focused almost exclusively on YouTube and a handful of other social platforms. Quality tops out at 1080p and there&apos;s no batch support or AI features.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-6">Nova DVR</h2>
        <p>Nova DVR is built on yt-dlp — the most actively maintained media extraction library with support for 1000+ sites. Key advantages:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Batch downloader</strong> — download entire playlists or multiple URLs at once</li>
          <li><strong>4K support</strong> — where available from the source</li>
          <li><strong>Subtitles</strong> — download and embed subtitle tracks</li>
          <li><strong>Trim</strong> — download only a specific time range</li>
          <li><strong>AI assistant</strong> — voice and text commands to automate downloads</li>
          <li><strong>No ads</strong> — clean, focused interface</li>
        </ul>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-6">Verdict</h2>
        <p>If you only need occasional simple YouTube downloads, any tool works. But if you download regularly, need batch support, want subtitle tracks, or use platforms beyond YouTube — Nova DVR is significantly more capable.</p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-5 mt-6">
          <p className="font-semibold text-blue-800 dark:text-blue-200">Try Nova DVR free</p>
          <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">No account required for your first 5 downloads per day.</p>
          <Link href="/" className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
            Open Downloader →
          </Link>
        </div>
      </div>
    </article>
  );
}
