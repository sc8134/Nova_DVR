"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Platform {
  id: string;
  label: string;
  icon: string;
  searchable: boolean;
  placeholder: string;
  color: string;
}

interface SearchResult {
  id: string;
  title: string;
  url: string;
  thumbnail: string | null;
  duration: number | null;
  uploader: string;
  view_count: number | null;
  platform: string;
}

interface SearchResultWithMeta extends SearchResult {
  cluster: string | null;
  selected: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS: Platform[] = [
  { id: "youtube",    label: "YouTube",     icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=32",     searchable: true,  placeholder: "Search YouTube…",               color: "bg-red-600"    },
  { id: "soundcloud", label: "SoundCloud",  icon: "https://www.google.com/s2/favicons?domain=soundcloud.com&sz=32",  searchable: true,  placeholder: "Search SoundCloud…",            color: "bg-orange-500" },
  { id: "bilibili",   label: "Bilibili",    icon: "https://www.google.com/s2/favicons?domain=bilibili.com&sz=32",    searchable: true,  placeholder: "Search Bilibili…",              color: "bg-cyan-500"   },
  { id: "facebook",   label: "Facebook",    icon: "https://www.google.com/s2/favicons?domain=facebook.com&sz=32",    searchable: false, placeholder: "Paste Facebook video URL…",      color: "bg-blue-600"   },
  { id: "instagram",  label: "Instagram",   icon: "https://www.google.com/s2/favicons?domain=instagram.com&sz=32",   searchable: false, placeholder: "Paste Instagram reel URL…",      color: "bg-pink-600"   },
  { id: "tiktok",     label: "TikTok",      icon: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=32",      searchable: false, placeholder: "Paste TikTok video URL…",        color: "bg-slate-900"  },
  { id: "x",          label: "X (Twitter)", icon: "https://www.google.com/s2/favicons?domain=x.com&sz=32",           searchable: false, placeholder: "Paste X / Twitter video URL…",   color: "bg-slate-800"  },
];

const SEARCHABLE = PLATFORMS.filter((p) => p.searchable);

const CLUSTERS = [
  { label: "🎵 Music",    keywords: ["music","song","track","album","remix","official audio","lyric","mv","official video"] },
  { label: "🎓 Tutorial", keywords: ["tutorial","how to","guide","learn","lesson","course","explained"] },
  { label: "🎮 Gaming",   keywords: ["gameplay","gaming","playthrough","walkthrough","lets play","speedrun"] },
  { label: "📰 News",     keywords: ["news","breaking","update","report","press","latest"] },
  { label: "🎙 Podcast",  keywords: ["podcast","interview","talk","discussion","episode","ep."] },
  { label: "📦 Review",   keywords: ["review","unboxing","hands on","comparison","vs","test"] },
  { label: "🎬 Trailer",  keywords: ["trailer","teaser","preview","official trailer","clip"] },
  { label: "🎭 Vlog",     keywords: ["vlog","day in","daily","my life","routine"] },
];

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCluster(title: string): string | null {
  const lower = title.toLowerCase();
  for (const c of CLUSTERS) {
    if (c.keywords.some((k) => lower.includes(k))) return c.label;
  }
  return null;
}

function formatDuration(s: number | null): string | null {
  if (!s) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

function formatViews(n: number | null): string | null {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function getSavedSearches(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("novaDvrSavedSearches") || "[]"); } catch { return []; }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeletons({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
          <div className="w-full h-28 bg-slate-200 dark:bg-slate-700" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
            <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Result Card ─────────────────────────────────────────────────────────────

interface CardProps {
  result: SearchResultWithMeta;
  index: number;
  onToggle: (i: number) => void;
  onDownload: (url: string) => void;
  showPlatformBadge?: boolean;
  badge?: React.ReactNode;
}

function ResultCard({ result: r, index, onToggle, onDownload, showPlatformBadge, badge }: CardProps) {
  const dur = formatDuration(r.duration);
  const views = formatViews(r.view_count);
  const platformData = PLATFORMS.find((p) => p.id === r.platform);
  return (
    <div className={`group relative bg-white dark:bg-slate-800 rounded-2xl border transition shadow-sm overflow-hidden hover:shadow-md ${r.selected ? "border-violet-500 ring-2 ring-violet-400/50" : "border-slate-200 dark:border-slate-700"}`}>
      {/* Thumbnail – clickable to toggle select */}
      <div className="relative w-full h-28 bg-slate-100 dark:bg-slate-700 cursor-pointer overflow-hidden" onClick={() => onToggle(index)}>
        {r.thumbnail
          ? <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-2xl text-slate-400">🎬</div>
        }
        {dur && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">{dur}</span>
        )}
        {badge}
        {/* Checkbox overlay */}
        <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${r.selected ? "bg-violet-600 border-violet-600" : "bg-white/80 border-slate-300 opacity-0 group-hover:opacity-100"}`}>
          {r.selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        {/* Platform badge */}
        {showPlatformBadge && platformData && (
          <div className="absolute top-1.5 right-1.5">
            <Image src={platformData.icon} alt={platformData.label} width={16} height={16} className="rounded-sm" unoptimized />
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">{r.title}</p>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
          {r.uploader && <span className="truncate max-w-[80px]">{r.uploader}</span>}
          {views && <><span>·</span><span>{views}</span></>}
        </div>
        {r.cluster && (
          <span className="inline-block text-[10px] font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">{r.cluster}</span>
        )}
        <div className="flex gap-1.5 pt-1">
          <button
            onClick={() => onDownload(r.url)}
            className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold py-1.5 rounded-lg transition"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
            Download
          </button>
          <a
            href={r.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 transition"
            title="Open in new tab"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SearchHubPage() {
  const router = useRouter();

  // Tabs
  const [activeTab, setActiveTab] = useState<"search" | "trending" | "saved">("search");

  // Platform selection
  const [activePlatform, setActivePlatform] = useState<Platform>(PLATFORMS[0]);
  const [unifiedMode, setUnifiedMode] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(12);
  const [directUrl, setDirectUrl] = useState("");
  const [results, setResults] = useState<SearchResultWithMeta[]>([]);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Smart filters
  const [filterType, setFilterType] = useState<"all" | "video" | "audio">("all");
  const [filterDuration, setFilterDuration] = useState<"all" | "short" | "long">("all");

  // Trending
  const [trending, setTrending] = useState<SearchResultWithMeta[]>([]);
  const [trendingPlatform, setTrendingPlatform] = useState("youtube");
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [trendingError, setTrendingError] = useState("");
  const [trendingLoaded, setTrendingLoaded] = useState(false);

  // Saved searches
  const [savedSearches, setSavedSearches] = useState<string[]>(getSavedSearches);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const sendToDownloader = (url: string) => router.push(`/?url=${encodeURIComponent(url)}`);

  const switchPlatform = (p: Platform) => {
    setActivePlatform(p);
    setQuery("");
    setDirectUrl("");
    setResults([]);
    setSearched(false);
    setSearchError("");
    setActiveCluster(null);
  };

  // ── Search ───────────────────────────────────────────────────────────────

  const searchPlatform = async (platformId: string, q: string): Promise<SearchResult[]> => {
    const res = await fetch(`${BACKEND}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, platform: platformId, limit }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return (data.results || []) as SearchResult[];
  };

  const clusterResults = async (raw: SearchResult[]): Promise<SearchResultWithMeta[]> => {
    // Call backend /ai/cluster for smarter multi-signal classification
    try {
      const res = await fetch(`${BACKEND}/ai/cluster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: raw.map((r) => ({ title: r.title, uploader: r.uploader, duration: r.duration })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const clusters: (string | null)[] = data.clusters || [];
        return raw.map((r, i) => ({ ...r, cluster: clusters[i] ?? null, selected: false }));
      }
    } catch { /* non-critical — fall back to client-side */ }
    // Fallback: client-side keyword match
    return raw.map((r) => ({ ...r, cluster: getCluster(r.title), selected: false }));
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearchError("");
    setLoading(true);
    setSearched(true);
    setActiveCluster(null);
    try {
      let raw: SearchResult[] = [];
      if (unifiedMode) {
        const settled = await Promise.allSettled(SEARCHABLE.map((p) => searchPlatform(p.id, query)));
        settled.forEach((r, i) => {
          if (r.status === "fulfilled") {
            raw.push(...r.value.map((item) => ({ ...item, platform: SEARCHABLE[i].id })));
          }
        });
      } else {
        raw = await searchPlatform(activePlatform.id, query);
      }
      setResults(await clusterResults(raw));
    } catch (e: unknown) {
      setSearchError(e instanceof Error ? e.message : "Search failed. Check backend connection.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSend = () => {
    const t = directUrl.trim();
    if (!t) { setSearchError("Please paste a URL."); return; }
    sendToDownloader(t);
  };

  // ── Multi-select & Batch ─────────────────────────────────────────────────

  const toggleSelect = (idx: number) =>
    setResults((prev) => prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r)));
  const selectAll = () => setResults((prev) => prev.map((r) => ({ ...r, selected: true })));
  const selectNone = () => setResults((prev) => prev.map((r) => ({ ...r, selected: false })));
  const selectedCount = results.filter((r) => r.selected).length;

  const sendSelectedToBatch = () => {
    const urls = results.filter((r) => r.selected).map((r) => r.url);
    if (!urls.length) return;
    sessionStorage.setItem("novaDvrBatchUrls", JSON.stringify(urls));
    router.push("/batch");
  };

  // ── Trending ─────────────────────────────────────────────────────────────

  const loadTrending = async (platform: string) => {
    setLoadingTrending(true);
    setTrendingError("");
    setTrending([]);
    try {
      const res = await fetch(`${BACKEND}/trending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, limit: 20 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTrending(
        await clusterResults(data.results || [])
      );
      setTrendingLoaded(true);
    } catch (e: unknown) {
      setTrendingError(e instanceof Error ? e.message : "Failed to load trending content.");
    } finally {
      setLoadingTrending(false);
    }
  };

  // ── Saved Searches ───────────────────────────────────────────────────────

  const saveSearch = () => {
    if (!query.trim()) return;
    const updated = [...new Set([query.trim(), ...savedSearches])].slice(0, 20);
    setSavedSearches(updated);
    localStorage.setItem("novaDvrSavedSearches", JSON.stringify(updated));
  };

  const deleteSaved = (q: string) => {
    const updated = savedSearches.filter((s) => s !== q);
    setSavedSearches(updated);
    localStorage.setItem("novaDvrSavedSearches", JSON.stringify(updated));
  };

  const runSaved = (q: string) => {
    setActiveTab("search");
    setQuery(q);
  };

  // ── Filtered results ─────────────────────────────────────────────────────

  const filtered = results.filter((r) => {
    if (activeCluster && r.cluster !== activeCluster) return false;
    if (filterType === "audio" && r.platform !== "soundcloud") return false;
    if (filterType === "video" && r.platform === "soundcloud") return false;
    if (filterDuration === "short" && r.duration !== null && r.duration > 300) return false;
    if (filterDuration === "long" && r.duration !== null && r.duration <= 300) return false;
    return true;
  });

  // Cluster counts from ALL results (not filtered)
  const clusterCounts: Record<string, number> = {};
  results.forEach((r) => { if (r.cluster) clusterCounts[r.cluster] = (clusterCounts[r.cluster] || 0) + 1; });
  const clusterEntries = Object.entries(clusterCounts).sort((a, b) => b[1] - a[1]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SearchHub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search across platforms or paste a direct URL.
          </p>
        </div>
        <button
          onClick={() => setUnifiedMode((v) => !v)}
          className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-xl border transition ${
            unifiedMode
              ? "bg-violet-600 text-white border-violet-600"
              : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-violet-400"
          }`}
        >
          🌐 {unifiedMode ? "Unified Search ON" : "Unified Search"}
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
        {(["search", "trending", "saved"] as const).map((tab) => {
          const labels: Record<string, string> = { search: "🔍 Search", trending: "🔥 Trending", saved: "🔖 Saved" };
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "trending" && !trendingLoaded) loadTrending(trendingPlatform);
              }}
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${
                activeTab === tab
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* ══ TRENDING TAB ══════════════════════════════════════════════════════ */}
      {activeTab === "trending" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Platform:</span>
            {["youtube", "soundcloud"].map((p) => (
              <button
                key={p}
                onClick={() => { setTrendingPlatform(p); loadTrending(p); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                  trendingPlatform === p
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-orange-400"
                }`}
              >
                {p === "youtube" ? "🎬 YouTube" : "🎵 SoundCloud"}
              </button>
            ))}
            <button
              onClick={() => loadTrending(trendingPlatform)}
              disabled={loadingTrending}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition ml-auto disabled:opacity-50"
            >
              {loadingTrending ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          {trendingError && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">{trendingError}</div>
          )}

          {/* Trending note */}
          {!loadingTrending && !trendingError && (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              ℹ️ {trendingPlatform === "youtube"
                ? "YouTube's public trending feed requires login since 2024 — showing popular recent videos instead."
                : "SoundCloud's charts API is restricted — showing popular tracks instead."}
            </p>
          )}

          {loadingTrending && <Skeletons count={20} />}

          {!loadingTrending && trending.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {trending.map((r, i) => (
                <ResultCard
                  key={r.id || r.url}
                  result={r}
                  index={i}
                  onToggle={() => {}}
                  onDownload={sendToDownloader}
                  badge={
                    <span className="absolute top-1.5 left-1.5 bg-orange-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">🔥 Trending</span>
                  }
                />
              ))}
            </div>
          )}

          {!loadingTrending && trending.length === 0 && !trendingError && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Click Refresh to load trending content</p>
            </div>
          )}
        </div>
      )}

      {/* ══ SAVED SEARCHES TAB ════════════════════════════════════════════════ */}
      {activeTab === "saved" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Saved Searches</p>
            <span className="text-xs text-slate-400 dark:text-slate-500">{savedSearches.length} saved</span>
          </div>
          {savedSearches.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">No saved searches yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Search something and click 🔖 Save Search</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {savedSearches.map((q) => (
                <div key={q} className="px-6 py-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-700 dark:text-slate-200 truncate">{q}</p>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => runSaved(q)}
                      className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition"
                    >
                      Search
                    </button>
                    <button
                      onClick={() => deleteSaved(q)}
                      className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ SEARCH TAB ════════════════════════════════════════════════════════ */}
      {activeTab === "search" && (
        <>
          {/* ── Unified mode banner ── */}
          {unifiedMode && (
            <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-2xl px-5 py-3 flex items-center gap-3 flex-wrap">
              {SEARCHABLE.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 text-xs text-violet-700 dark:text-violet-300">
                  <Image src={p.icon} alt={p.label} width={14} height={14} className="rounded-sm" unoptimized />
                  {p.label}
                </div>
              ))}
              <span className="text-xs text-violet-500 dark:text-violet-400 italic ml-auto">— searched simultaneously</span>
            </div>
          )}

          {/* ── Platform tabs (single-platform mode only) ── */}
          {!unifiedMode && (
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map((p) => {
                const active = activePlatform.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => switchPlatform(p)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                      active
                        ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <Image src={p.icon} alt={p.label} width={16} height={16} className="rounded-sm" unoptimized />
                    {p.label}
                    {!p.searchable && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                      }`}>URL</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Search / URL input panel ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">

            {/* Searchable platform */}
            {(unifiedMode || activePlatform.searchable) && (
              <div className="space-y-3">
                {/* Result count + save */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Results:</span>
                  {[12, 25, 50].map((n) => (
                    <button
                      key={n}
                      onClick={() => setLimit(n)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                        limit === n
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={saveSearch}
                    disabled={!query.trim()}
                    className="ml-auto text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 transition"
                  >
                    🔖 Save Search
                  </button>
                </div>

                {/* Search input + button */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder={unifiedMode ? "Search all platforms at once…" : activePlatform.placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className={`flex-1 border rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                      unifiedMode
                        ? "border-violet-300 dark:border-violet-600 focus:ring-violet-500"
                        : "border-slate-200 dark:border-slate-600 focus:ring-blue-500"
                    }`}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading || !query.trim()}
                    className={`shrink-0 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 ${
                      unifiedMode ? "bg-violet-600 hover:bg-violet-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Searching…
                      </>
                    ) : unifiedMode ? "🌐 Search All" : "Search"}
                  </button>
                </div>
              </div>
            )}

            {/* URL-only platform */}
            {!unifiedMode && !activePlatform.searchable && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 text-sm">
                  <Image src={activePlatform.icon} alt={activePlatform.label} width={18} height={18} className="rounded-sm shrink-0" unoptimized />
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-white">{activePlatform.label}</span> doesn&apos;t support search. Paste a URL and click{" "}
                    <span className="font-semibold">Send to Downloader</span>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <input
                    type="url"
                    placeholder={activePlatform.placeholder}
                    value={directUrl}
                    onChange={(e) => { setDirectUrl(e.target.value); setSearchError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleDirectSend()}
                    className="flex-1 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    onClick={handleDirectSend}
                    disabled={!directUrl.trim()}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                  >
                    Send to Downloader
                  </button>
                </div>
              </div>
            )}

            {/* Error message */}
            {searchError && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {searchError}
              </div>
            )}
          </div>

          {/* ── Loading skeletons ── */}
          {loading && <Skeletons count={limit > 12 ? 12 : limit} />}

          {/* ── No results ── */}
          {!loading && searched && results.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center space-y-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No results found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Try a different search term</p>
            </div>
          )}

          {/* ── Results ── */}
          {!loading && results.length > 0 && (
            <>
              {/* Smart Filters */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Type:</span>
                  {(["all", "video", "audio"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                        filterType === t
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400"
                      }`}
                    >
                      {t === "all" ? "All" : t === "video" ? "📹 Video" : "🎵 Audio"}
                    </button>
                  ))}
                  <span className="text-slate-300 dark:text-slate-600 mx-1">|</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Duration:</span>
                  {(["all", "short", "long"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilterDuration(d)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                        filterDuration === d
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400"
                      }`}
                    >
                      {d === "all" ? "Any" : d === "short" ? "⚡ Short <5min" : "📽 Long >5min"}
                    </button>
                  ))}
                </div>

                {/* AI Cluster pills */}
                {clusterEntries.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">🤖 Categories:</span>
                    <button
                      onClick={() => setActiveCluster(null)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                        !activeCluster
                          ? "bg-violet-600 text-white border-violet-600"
                          : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-violet-400"
                      }`}
                    >
                      All ({results.length})
                    </button>
                    {clusterEntries.map(([label, count]) => (
                      <button
                        key={label}
                        onClick={() => setActiveCluster(activeCluster === label ? null : label)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                          activeCluster === label
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-violet-400"
                        }`}
                      >
                        {label} ({count})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Batch toolbar */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400">{filtered.length} results</span>
                <div className="flex gap-1.5 ml-auto">
                  <button
                    onClick={selectAll}
                    className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition"
                  >
                    Select All
                  </button>
                  <button
                    onClick={selectNone}
                    className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition"
                  >
                    None
                  </button>
                  {selectedCount > 0 && (
                    <button
                      onClick={sendSelectedToBatch}
                      className="text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      Send {selectedCount} to Batch
                    </button>
                  )}
                </div>
              </div>

              {/* Results grid */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filtered.map((r) => {
                    const originalIdx = results.findIndex((x) => x === r);
                    return (
                      <ResultCard
                        key={r.id || r.url}
                        result={r}
                        index={originalIdx}
                        onToggle={toggleSelect}
                        onDownload={sendToDownloader}
                        showPlatformBadge={unifiedMode}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No results match the current filters</p>
                </div>
              )}
            </>
          )}
        </>
      )}

    </div>
  );
}
