import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube to MP3: Extract High-Quality Audio — Nova DVR",
  description: "How to convert YouTube videos to MP3 at the best quality. Choosing the right bitrate and format explained.",
};

export default function Post() {
  return (
    <article className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">← Back to Blog</Link>
      <header className="space-y-4">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">Guide</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">YouTube to MP3: The Right Way to Extract High-Quality Audio</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">June 2025 · 5 min read</p>
      </header>
      <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p className="text-base">Converting YouTube videos to MP3 sounds simple, but most tools do it wrong — re-encoding audio multiple times and losing quality in the process. Here&apos;s how to get the cleanest result.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">How Nova DVR extracts audio</h2>
        <p>When you select an audio format, Nova DVR downloads the original audio stream directly from YouTube — typically an AAC or Opus stream at 128kbps or higher — and converts it once to MP3 at 192kbps. This single-pass conversion preserves maximum quality.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Choosing the right bitrate</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-300">Bitrate</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-300">Quality</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-300">Best for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                ["128kbps", "Good", "Podcasts, speech, background music"],
                ["192kbps", "Very good", "Most music — the sweet spot"],
                ["256kbps", "Excellent", "Audiophiles, archiving"],
                ["320kbps", "Maximum", "Studio-quality, large files"],
              ].map(([br, q, use]) => (
                <tr key={br} className="bg-white dark:bg-slate-800/50">
                  <td className="px-4 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{br}</td>
                  <td className="px-4 py-2.5">{q}</td>
                  <td className="px-4 py-2.5 text-slate-500">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Step by step</h2>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Paste the YouTube URL into Nova DVR and click <strong>Inspect URL</strong></li>
          <li>Click <strong>Check Available Formats</strong></li>
          <li>Scroll to the <strong>Audio Only — MP3</strong> section</li>
          <li>Select your preferred bitrate and click <strong>Download</strong></li>
        </ol>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">What about music videos?</h2>
        <p>For official music videos, select the highest available audio bitrate. YouTube streams music at up to 256kbps for Premium content, though most public videos offer 128kbps audio streams.</p>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bulk MP3 downloads</h2>
        <p>To download an entire album or playlist as MP3, use the <Link href="/batch" className="text-blue-600 dark:text-blue-400 hover:underline">Batch Downloader</Link>. Paste the playlist URL, click <strong>Explode</strong> to expand it, set the global preset to <strong>Best MP3</strong>, and hit <strong>Download All</strong>.</p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-5">
          <p className="font-semibold text-blue-800 dark:text-blue-200">Extract audio now</p>
          <Link href="/" className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">Open Downloader →</Link>
        </div>
      </div>
    </article>
  );
}
