import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Download Instagram Reels and TikTok Videos Without Watermark — Nova DVR",
  description: "Save Instagram Reels and TikTok videos to your device without watermarks using Nova DVR.",
};

export default function Post() {
  return (
    <article className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">← Back to Blog</Link>
      <header className="space-y-4">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">Guide</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">How to Download Instagram Reels and TikTok Videos Without Watermark</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">June 2025 · 3 min read</p>
      </header>
      <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p className="text-base">Both Instagram and TikTok add watermarks when you save videos natively through their apps. Nova DVR downloads the original video file directly — no watermark, no re-encoding, full quality.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Downloading Instagram Reels</h2>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Open the Reel on Instagram and tap the three-dot menu → <strong>Copy Link</strong></li>
          <li>Go to <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Nova DVR</Link> and paste the URL</li>
          <li>Click <strong>Inspect URL</strong> then <strong>Check Available Formats</strong></li>
          <li>Select MP4 and click <strong>Download</strong></li>
        </ol>
        <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3">
          Note: Private Instagram accounts require you to be logged in. Nova DVR can only download public content.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Downloading TikTok Videos</h2>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Open the TikTok video and tap <strong>Share → Copy Link</strong></li>
          <li>Paste the link into Nova DVR and click <strong>Inspect URL</strong></li>
          <li>Select the MP4 format and download</li>
        </ol>
        <p>The downloaded file comes directly from TikTok&apos;s servers — no watermark is added because we&apos;re not using TikTok&apos;s save feature.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Batch Downloading</h2>
        <p>If you have multiple Reels or TikToks to download, use the <Link href="/batch" className="text-blue-600 dark:text-blue-400 hover:underline">Batch Downloader</Link>. Paste each URL on a new line and click <strong>Fetch All Formats</strong>, then <strong>Download All</strong>.</p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-5">
          <p className="font-semibold text-blue-800 dark:text-blue-200">Try it now</p>
          <Link href="/" className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">Open Downloader →</Link>
        </div>
      </div>
    </article>
  );
}
