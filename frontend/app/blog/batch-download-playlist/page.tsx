import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Batch Download an Entire YouTube Playlist — Nova DVR",
  description: "Save every video in a YouTube playlist with one click using Nova DVR's batch downloader.",
};

export default function Post() {
  return (
    <article className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">← Back to Blog</Link>
      <header className="space-y-4">
        <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1 rounded-full">Tutorial</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">How to Batch Download an Entire YouTube Playlist</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">June 2025 · 3 min read</p>
      </header>
      <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p className="text-base">Downloading a full YouTube playlist one video at a time is tedious. Nova DVR&apos;s batch downloader lets you expand an entire playlist and download everything in parallel — with individual format control for each video.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Method 1 — Explode a playlist</h2>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Copy the playlist URL from YouTube (e.g. <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs font-mono">youtube.com/playlist?list=PL...</code>)</li>
          <li>Go to <Link href="/batch" className="text-blue-600 dark:text-blue-400 hover:underline">Batch Downloader</Link> and paste the URL</li>
          <li>Click <strong>💥 Explode</strong> — all videos in the playlist are added to the queue</li>
          <li>Click <strong>Fetch All Formats</strong> to load available formats for each video</li>
          <li>Use the global preset (e.g. <strong>1080p MP4</strong> or <strong>Best MP3</strong>) to set the format for all videos at once</li>
          <li>Click <strong>⚡ Download</strong> to start parallel downloads</li>
        </ol>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Method 2 — Smart Paste</h2>
        <p>Have a list of URLs from different sources? Click <strong>🧠 Smart Paste</strong>, paste any text (an email, a webpage, a chat log) and Nova DVR will automatically extract all valid video URLs and add them to the queue.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Parallel downloads</h2>
        <p>The batch downloader runs up to 3 downloads simultaneously. Each item shows an individual progress bar with speed and ETA. Completed files are automatically sent to your browser&apos;s Downloads folder.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tips</h2>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use the checkboxes to select only specific videos from a playlist</li>
          <li>Set a custom save directory in <Link href="/settings" className="text-blue-600 dark:text-blue-400 hover:underline">Settings</Link> so all files go to the same folder</li>
          <li>The global preset overrides individual format selections — set it to <strong>Custom</strong> to keep per-video choices</li>
        </ul>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-5">
          <p className="font-semibold text-green-800 dark:text-green-200">Try Batch Downloader</p>
          <Link href="/batch" className="inline-block mt-3 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">Open Batch →</Link>
        </div>
      </div>
    </article>
  );
}
