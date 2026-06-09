import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Nova DVR",
  description: "Guides, tips and comparisons for downloading video and audio from any platform.",
};

const POSTS = [
  {
    slug: "how-to-download-youtube-videos",
    title: "How to Download YouTube Videos in 2025 (Any Resolution)",
    excerpt: "Step-by-step guide to downloading YouTube videos as MP4 or MP3 — from 360p all the way to 4K — without any software installation.",
    date: "June 2025",
    readTime: "4 min read",
    tag: "Guide",
    tagColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  {
    slug: "nova-dvr-vs-competitors",
    title: "Nova DVR vs Y2Mate vs SSYouTube — Which Is Best in 2025?",
    excerpt: "An honest comparison of the top video downloaders. We look at supported sites, download quality, batch support, and privacy.",
    date: "June 2025",
    readTime: "6 min read",
    tag: "Comparison",
    tagColor: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  },
  {
    slug: "download-instagram-reels-tiktok",
    title: "How to Download Instagram Reels and TikTok Videos Without Watermark",
    excerpt: "The complete guide to saving Reels and TikToks to your device — no watermark, no apps, any device.",
    date: "June 2025",
    readTime: "3 min read",
    tag: "Guide",
    tagColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  {
    slug: "youtube-to-mp3",
    title: "YouTube to MP3: The Right Way to Extract High-Quality Audio",
    excerpt: "How to get the best audio quality when converting YouTube videos to MP3 — choosing the right bitrate, format and tools.",
    date: "June 2025",
    readTime: "5 min read",
    tag: "Guide",
    tagColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  {
    slug: "batch-download-playlist",
    title: "How to Batch Download an Entire YouTube Playlist",
    excerpt: "Save every video in a playlist with one click using Nova DVR's batch downloader — including format selection and parallel downloads.",
    date: "June 2025",
    readTime: "3 min read",
    tag: "Tutorial",
    tagColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  },
  {
    slug: "supported-sites-2025",
    title: "1000+ Sites You Can Download From Using Nova DVR",
    excerpt: "The full list of platforms supported by yt-dlp — from mainstream social networks to niche streaming sites.",
    date: "June 2025",
    readTime: "2 min read",
    tag: "Reference",
    tagColor: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  },
];

export default function BlogPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10">

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Blog</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Guides, tips and comparisons for downloading video and audio from any platform.
        </p>
      </div>

      {/* Featured post */}
      <Link href={`/blog/${POSTS[0].slug}`} className="block group">
        <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-8 text-white space-y-3 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-200">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {POSTS[0].tag}
          </span>
          <h2 className="text-xl md:text-2xl font-bold leading-snug group-hover:underline underline-offset-2">
            {POSTS[0].title}
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">{POSTS[0].excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-blue-200 pt-1">
            <span>{POSTS[0].date}</span>
            <span>·</span>
            <span>{POSTS[0].readTime}</span>
            <span className="ml-auto font-semibold group-hover:translate-x-1 transition-transform">
              Read article →
            </span>
          </div>
        </div>
      </Link>

      {/* Post grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {POSTS.slice(1).map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 h-full flex flex-col">
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${post.tagColor}`}>
                {post.tag}
              </span>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                {post.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>{post.date} · {post.readTime}</span>
                <span className="text-blue-500 font-semibold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
