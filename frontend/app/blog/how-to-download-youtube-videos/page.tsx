import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Download YouTube Videos in 2025 — Nova DVR",
  description: "Step-by-step guide to downloading YouTube videos as MP4 or MP3 in any resolution using Nova DVR.",
};

export default function Post() {
  return (
    <article className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Back to Blog
      </Link>

      <header className="space-y-4">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">Guide</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
          How to Download YouTube Videos in 2025 (Any Resolution)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">June 2025 · 4 min read</p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">

        <p className="text-base">
          Downloading YouTube videos doesn&apos;t require installing any software. Nova DVR runs entirely in your browser and lets you save any public video as MP4 or MP3 — from 360p all the way up to 4K.
        </p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-6">Step 1 — Copy the YouTube URL</h2>
        <p>Open the YouTube video you want to download. Copy the URL from your browser&apos;s address bar. It will look like: <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">https://www.youtube.com/watch?v=dQw4w9WgXcQ</code></p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-6">Step 2 — Paste and Inspect</h2>
        <p>Go to the <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">Nova DVR Downloader</Link> page. Paste the URL into the input box and click <strong>Inspect URL</strong>. Nova DVR will fetch the video&apos;s title, thumbnail, duration and view count to confirm the link is valid.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-6">Step 3 — Choose a Format</h2>
        <p>Click <strong>Check Available Formats</strong>. You&apos;ll see a grid of options:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Video formats</strong> — 144p, 360p, 480p, 720p, 1080p, 1440p, 4K (MP4)</li>
          <li><strong>Audio formats</strong> — various bitrates as MP3</li>
        </ul>
        <p>Our AI assistant will suggest the best format based on your download history. For most users, <strong>1080p MP4</strong> is the best balance of quality and file size.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-6">Step 4 — Download</h2>
        <p>Select your format and click <strong>Download</strong>. A live progress bar shows the download speed and estimated time remaining. Once complete, the file is saved directly to your Downloads folder.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-6">Downloading as MP3</h2>
        <p>To save just the audio, select any format from the <strong>Audio Only — MP3</strong> section. Nova DVR extracts the audio track and converts it to a clean MP3 at 192kbps.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-6">Tips</h2>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use <strong>Batch Downloader</strong> to download multiple videos at once</li>
          <li>Paste a playlist URL and click <strong>Explode</strong> to add all videos automatically</li>
          <li>Set a custom save folder in <Link href="/settings" className="text-blue-600 dark:text-blue-400 hover:underline">Settings</Link> to keep downloads organised</li>
          <li>Use the trim feature to download only a specific section of a video</li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-5 mt-6">
          <p className="font-semibold text-blue-800 dark:text-blue-200">Ready to try it?</p>
          <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">Nova DVR is free to use — no account required for your first 5 downloads per day.</p>
          <Link href="/" className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
            Open Downloader →
          </Link>
        </div>
      </div>
    </article>
  );
}
