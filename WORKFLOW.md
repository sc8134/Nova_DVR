# Nova DVR — Full Project Workflow

> Professional multi-platform media downloader built with **Next.js 16 + Flask + yt-dlp**
> Built by [Sagar RC](https://sagarrc.com.np) · GitHub: [sc8134/Nova_DVR](https://github.com/sc8134/Nova_DVR)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Project Structure](#3-project-structure)
4. [Tech Stack](#4-tech-stack)
5. [Prerequisites](#5-prerequisites)
6. [Installation & Setup](#6-installation--setup)
7. [Running the Project](#7-running-the-project)
8. [Backend API Reference](#8-backend-api-reference)
9. [Frontend Pages & Components](#9-frontend-pages--components)
10. [AI Features](#10-ai-features)
11. [Voice Assistant & Chat](#11-voice-assistant--chat)
12. [Advanced Download Options](#12-advanced-download-options)
13. [Feature Workflows](#13-feature-workflows)
14. [Settings & Persistence](#14-settings--persistence)
15. [Stability & Reliability](#15-stability--reliability)
16. [Supported Platforms](#16-supported-platforms)
17. [Known Limits](#17-known-limits)
18. [Environment Variables](#18-environment-variables)

---

## 1. Project Overview

Nova DVR is a local media downloader web application. It provides a modern browser UI to:

- Download MP4 videos (144p → 4K) and MP3 audio from 1000+ websites via yt-dlp
- Inspect URLs before downloading — see thumbnail, title, platform, duration, views, subtitles
- AI-powered content summary, smart format recommendation, and error explanation
- **Voice Assistant** — natural language commands via Web Speech API ("Search YouTube for...", "Download this as MP3")
- **NLP Chat Backend** — `/chat` endpoint parses intent server-side with regex + keyword rules
- Search YouTube, SoundCloud, and Bilibili directly in-app with **AI category clustering** via `/ai/cluster`
- **Smart Paste** — extract multiple URLs from any text block automatically
- **Playlist/Channel Exploder** — paste one playlist URL, auto-expand to 50+ individual items
- **Video Trimming** — select exact start/end times before downloading (HH:MM:SS dual slider)
- **Subtitle Embedding** — auto-detect browser language, embed in MP4 or save as .srt/.vtt
- Paste direct URLs from Facebook, Instagram, TikTok, and X
- Download multiple URLs in batch with global format presets
- **Real-time Progress Streaming** — live download speed, percent, and ETA via SSE
- Files stream directly to the browser → saved to the system Downloads folder
- **Saved Searches** — monitor specific queries every 5 minutes + desktop notifications
- Configure custom download directory, theme (dark/light), and desktop notifications
- Track all downloads in a history summary with a monitoring dashboard
- **Stability layer** — retry logic, metadata caching, concurrency limiting, temp cleanup

---

## 2. Architecture

```
┌──────────────────────────────────────────────┐
│              Browser (Client)                │
│    Next.js 16 App Router  — Port 3000        │
│                                              │
│  / Downloader   /batch    /searchhub         │
│  /summary       /settings                   │
└────────────────────┬─────────────────────────┘
                     │  HTTP fetch (JSON) + SSE
                     ▼
┌──────────────────────────────────────────────┐
│         Flask Backend — Port 5000            │
│                                              │
│  GET  /health           ← liveness probe     │
│  POST /inspect          ← validate URL       │
│  POST /list-formats     ← get quality list   │
│  POST /download         ← download + SSE     │
│  POST /download-with-options ← trim/subs+SSE │
│  GET  /serve-file       ← stream to browser  │
│  POST /batch-download   ← batch endpoint     │
│  POST /search           ← search platforms   │
│  POST /subtitles        ← subtitle tracks    │
│  POST /playlist-explode ← expand playlist    │
│  POST /trending         ← trending content   │
│  POST /ai/summarize     ← content summary    │
│  POST /ai/recommend     ← format suggestion  │
│  POST /ai/explain-error ← error translation  │
│  POST /ai/cluster       ← category classify  │
│  POST /chat             ← NLP intent parser  │
└────────────────────┬─────────────────────────┘
                     │  Semaphore (max 5 concurrent)
                     ▼
┌──────────────────────────────────────────────┐
│         In-Memory Cache (5-min TTL)          │
│  /inspect, /list-formats, /search cached     │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│              yt-dlp + FFmpeg                 │
│  Extracts info + downloads + merges/converts │
│  Retry: up to 2× on transient errors         │
│  Socket timeout: 20-30s                      │
└────────────────────┬─────────────────────────┘
                     │
          ┌──────────┴───────────┐
          ▼                      ▼
   Temp folder               Custom dir
   (streamed to          (if user set one
    browser → system       in Settings)
    Downloads; auto-     Files persist there
    cleaned after 30min)
```

---

## 3. Project Structure

```
Nova_DVR/
├── .gitignore
├── WORKFLOW.md              ← this file
├── task.md                  ← feature log
│
├── backend/
│   ├── app.py               # Flask API — 15 endpoints + stability layer
│   └── requirements.txt     # flask, flask-cors, yt-dlp>=2024.1.1
│
└── frontend/
    ├── app/
    │   ├── layout.tsx               # Root layout — Sidebar + ThemeProvider + AppShell
    │   ├── page.tsx                 # / — Single URL Downloader
    │   ├── globals.css              # Tailwind v4 + dark mode
    │   ├── Sidebar.tsx              # Navigation sidebar with background image
    │   ├── ThemeProvider.tsx        # Dark/light context
    │   │
    │   ├── batch/
    │   │   └── page.tsx             # /batch — Batch Downloader
    │   │
    │   ├── searchhub/
    │   │   └── page.tsx             # /searchhub — SearchHub (search + trending + saved)
    │   │
    │   ├── summary/
    │   │   └── page.tsx             # /summary — History + Search Monitor Dashboard
    │   │
    │   ├── settings/
    │   │   └── page.tsx             # /settings — App Settings
    │   │
    │   ├── components/
    │   │   ├── AppShell.tsx             # Client hook host (background monitors)
    │   │   ├── ChatDrawer.tsx           # AI Assistant drawer + voice + search
    │   │   ├── TrimSlider.tsx           # Dual-handle HH:MM:SS trim slider
    │   │   ├── SupportedSites.tsx       # 46+ platform grid with favicons
    │   │   └── DownloadLocationModal.tsx # First-run folder picker
    │   │
    │   ├── hooks/
    │   │   ├── useBackendStatus.ts      # Polls /health every 30s
    │   │   └── useSavedSearchesMonitor.ts # Background search monitor (5 min)
    │   │
    │   └── lib/
    │       └── fetchWithRetry.ts        # Resilient fetch (timeout + retry + abort)
    │
    ├── public/
    │   ├── nova_logo.png
    │   └── sidebar background.png
    │
    ├── .env.local               # NEXT_PUBLIC_BACKEND_URL
    ├── next.config.ts
    ├── postcss.config.mjs
    └── package.json
```

---

## 4. Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| Next.js | 16.2.7 | React framework, App Router, SSR |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling, class-based dark mode |
| `next/image` | built-in | Optimized image rendering |
| `next/navigation` | built-in | `usePathname`, `useRouter`, `useSearchParams` |

### Backend
| Package | Version | Purpose |
|---|---|---|
| Flask | 3.0.3 | Python web server |
| flask-cors | 4.0.0 | Cross-origin requests from frontend |
| yt-dlp | ≥2024.1.1 | Media extraction and downloading |
| FFmpeg | system | MP4 merge (video+audio streams), MP3 conversion, trim |

---

## 5. Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **FFmpeg** — required for merging video+audio, MP3 conversion, and trimming

### Install FFmpeg (Windows)
```powershell
winget install ffmpeg
# OR download from https://ffmpeg.org/download.html and add to PATH
```

### Verify
```bash
python --version    # 3.11+
node --version      # 18+
ffmpeg -version     # any recent version
```

---

## 6. Installation & Setup

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate.bat       # Windows CMD
# venv\Scripts\Activate.ps1    # PowerShell

# Install dependencies (includes yt-dlp)
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

### Environment Variable

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## 7. Running the Project

Two terminals required.

### Terminal 1 — Flask Backend
```bash
cd backend
venv\Scripts\activate.bat
python app.py
# → http://localhost:5000
```

### Terminal 2 — Next.js Frontend
```bash
cd frontend
npm run dev
# → http://localhost:3000
```

---

## 8. Backend API Reference

Base URL: `http://localhost:5000`

---

### `GET /health`

Liveness probe. Also evicts expired cache entries.

**Response:**
```json
{ "status": "ok", "cache_entries": 12, "active_downloads": 2 }
```

---

### `POST /inspect`

Validates a URL and returns video metadata. Result cached 5 min.

**Request:** `{ "url": "https://..." }`

**Response:**
```json
{
  "valid": true,
  "title": "Never Gonna Give You Up",
  "uploader": "Rick Astley",
  "duration": 213,
  "thumbnail": "https://i.ytimg.com/...",
  "platform": "Youtube",
  "view_count": 1500000000,
  "upload_date": "20091025",
  "webpage_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

---

### `POST /list-formats`

Returns deduplicated video + audio formats. Result cached 5 min.

**Request:** `{ "url": "https://..." }`

**Response:**
```json
{
  "formats": [
    { "format_id": "137", "ext": "mp4", "resolution": "1080p", "type": "video+audio" },
    { "format_id": "248", "ext": "mp4", "resolution": "720p",  "type": "video+audio" },
    { "format_id": "140", "ext": "mp3", "resolution": null, "abr": 128, "type": "audio-only", "note": "128kbps MP3" }
  ],
  "title": "Never Gonna Give You Up"
}
```

**Format rules:**
- Video: accepts `mp4`/`webm`/`m4v` streams, always output as MP4. Resolutions: `144p → 4K`.
- 4K tagged as `display_only: true` — downloads at best available quality.
- Audio: always converted to **MP3** by FFmpeg. Grouped by bitrate bucket.
- Video streams always merged with `+bestaudio` via FFmpeg at download time.

---

### `POST /download`

Downloads a single URL. Streams real-time progress via **SSE**. Respects concurrency semaphore (max 5).

**Request:**
```json
{ "url": "https://...", "format_id": "137", "is_audio": false, "is_4k": false, "download_dir": "" }
```

**SSE Response stream:**
```
data: {"status": "downloading", "percent": "45.2", "speed": "2.5MiB/s", "eta": "3m22s"}
data: {"status": "processing", "message": "Finished downloading, post-processing..."}
data: {"status": "done", "filepath": "/tmp/nova_dvr_temp/Title.mp4", "filename": "Title.mp4", "is_temp": true}
```

**Retry behaviour:** Up to 2 automatic retries with exponential back-off on transient errors. Permanent errors (private, geo-blocked, copyright, etc.) fail immediately without retry.

---

### `POST /download-with-options`

Advanced download — trim + subtitles + SSE progress.

**Request:**
```json
{
  "url": "https://...",
  "format_id": "137",
  "is_audio": false,
  "download_dir": "",
  "start_time": "00:02:00",
  "end_time": "00:05:30",
  "sub_lang": "en",
  "sub_format": "srt",
  "embed_subs": true
}
```

- `start_time` / `end_time` — HH:MM:SS trim range using FFmpeg `download_ranges`
- `embed_subs: true` → hardcodes subtitles into MP4
- `embed_subs: false` → saves as separate `.srt`/`.vtt` file

---

### `POST /subtitles`

Lists available subtitle tracks. Auto-detects best language match.

**Request:** `{ "url": "https://...", "preferred_lang": "en-US" }`

**Response:**
```json
{
  "subtitles": [
    { "lang": "en", "name": "en", "auto": false, "formats": ["vtt", "ttml", "srv3"] },
    { "lang": "en-US", "name": "en-US (auto)", "auto": true, "formats": ["vtt"] }
  ],
  "recommended_lang": "en"
}
```

`recommended_lang` is scored: exact match → base language match → English fallback → first available.

---

### `POST /playlist-explode`

Expands a playlist/channel URL into individual items (up to 50).

**Request:** `{ "url": "https://www.youtube.com/playlist?list=..." }`

**Response:**
```json
{
  "is_playlist": true,
  "playlist_title": "My Playlist",
  "count": 47,
  "items": [
    { "id": "...", "url": "https://...", "title": "Video 1", "duration": 456, "thumbnail": "https://..." }
  ]
}
```

---

### `POST /trending`

Fetches popular content. YouTube uses search fallback (direct trending requires auth since 2024).

**Request:** `{ "platform": "youtube", "limit": 20 }`

---

### `POST /search`

Searches YouTube, SoundCloud, or Bilibili. Results cached 5 min.

**Request:** `{ "query": "lofi hip hop", "platform": "youtube", "limit": 25 }`

**Platform limits:**
| Platform | Max results |
|---|---|
| YouTube | ~20 (Google API hard limit) |
| SoundCloud | ~50 |
| Bilibili | ~50 |
| Facebook, Instagram, TikTok, X | ❌ No search — direct URL only |

---

### `GET /serve-file`

Streams downloaded file to browser (triggers system Downloads panel).

**Query params:** `?path=/full/path/to/file.mp4&temp=1`

- `temp=1` → file deleted from server after streaming
- `temp=0` → file stays in user's custom directory

---

### `POST /ai/summarize`

Generates a plain-English sentence from video metadata (no external API).

**Request:** `{ "title": "...", "uploader": "...", "duration": 213, "platform": "Youtube", "view_count": 1500000, "upload_date": "20091025" }`

**Response:** `{ "summary": "\"Never Gonna Give You Up\" is a Youtube video by Rick Astley..." }`

---

### `POST /ai/recommend`

Suggests the best format based on the user's download history.

**Request:** `{ "history": [...jobs from localStorage], "formats": [...format list] }`

**Response:** `{ "recommendation": { ...format_object }, "reason": "You usually download 1080p. Suggesting the same." }`

---

### `POST /ai/explain-error`

Translates raw yt-dlp errors into plain English + fix suggestion.

**Request:** `{ "error": "ERROR: Sign in to confirm your age..." }`

**Response:** `{ "explanation": "This video is private or age-restricted.", "suggestion": "Try using yt-dlp's --cookies option..." }`

---

### `POST /ai/cluster`

Classifies a batch of search results into content categories using multi-signal scoring (title keywords + uploader cues + duration).

**Request:**
```json
{ "items": [{ "title": "...", "uploader": "...", "duration": 213 }] }
```

**Response:** `{ "clusters": ["🎵 Music", null, "🎓 Tutorial", "🎮 Gaming"] }`

Categories: 🎵 Music, 🎓 Tutorial, 🎮 Gaming, 📰 News, 🎙 Podcast, 📦 Review, 🎬 Trailer, 🎭 Vlog

---

### `POST /chat`

Server-side NLP intent parser for the AI Assistant. Falls back to client-side parsing if unavailable.

**Request:** `{ "message": "search for lofi on soundcloud" }`

**Response:**
```json
{
  "intent": "search",
  "platform": "soundcloud",
  "query": "lofi",
  "url": null,
  "format": null,
  "reply": "🔍 Searching for \"lofi\" on Soundcloud…"
}
```

**Intents:** `search` · `download` · `trending` · `history` · `unknown`

**Format hints detected:** `mp3`, `audio`, `4k`, `1080p`, `720p`, `480p`, `360p`, `hd`, `best`

---

## 9. Frontend Pages & Components

### `/` — Downloader

3-step flow with URL inspection before format selection:

```
Step 1: Paste URL → "Inspect URL"
         → POST /inspect (cached)
         → Shows: thumbnail, title, uploader, platform badge, duration, views, date
         → 🤖 AI Summary banner auto-appears (POST /ai/summarize)

Step 2: "Check Available Formats"
         → POST /list-formats (cached)
         → Video grid: 144p / 240p / 360p / 480p / 720p / 1080p / 1440p / 4K (REF)
         → Audio grid: all available bitrates as MP3
         → 🤖 AI Recommendation banner with "Use suggestion" button
         → Subtitles auto-fetched with browser language → POST /subtitles
         → Auto-detected language pre-selected with "Auto-detected" badge

Step 3: "Download"
         → If no directory saved: DownloadLocationModal appears first
         → POST /download (SSE) or POST /download-with-options (if trim/subs active)
         → Real-time progress bar: percent, speed, ETA
         → GET /serve-file → file streams to browser → system Downloads folder
         → 🤖 AI Error Explanation on failure (POST /ai/explain-error)
         → Notification fires, session log updates, job saved to localStorage
```

**Inline Preview:** YouTube embeds iframe; other platforms show thumbnail + link.

**Advanced Options panel** (appears after formats load):
- ✂️ Trim slider — enable/disable, drag handles or type HH:MM:SS
- 💬 Subtitles — language dropdown (auto-detected), format (.srt/.vtt/.ass), embed toggle

---

### `/batch` — Batch Downloader

```
1. Add URLs individually or paste multiple lines
2. Smart Paste mode — paste any text, auto-extracts all valid URLs
3. Playlist Exploder — paste playlist URL → 💥 Explode → expands to 50+ items with checkboxes
4. "Fetch" per item or "Fetch All Formats" for the entire queue
5. Global Format Preset bar — apply one rule to all items:
   - 🎵 Best MP3 / 📹 1080p / 720p / 480p / 360p MP4
6. Each item shows format dropdown (can override preset)
7. Real-time master progress bar: "Downloading X of Y — speed — ETA"
8. Per-item progress bars showing % and speed
9. "Download (N)" → sequential downloads with live SSE progress
10. Each completed download triggers browser file save
11. Status per item: idle → fetching → ready → downloading → done / error
```

---

### `/searchhub` — SearchHub

**Three tabs:**

**🔍 Search:**
- Single platform or 🌐 Unified Search (all platforms simultaneously)
- Result count selector: 12 / 25 / 50
- Results clustered by `/ai/cluster` backend endpoint (multi-signal scoring)
- Category filter pills with counts: 🎵 Music (8) · 🎓 Tutorial (3) · etc.
- Smart filters: Type (video/audio), Duration (short <5min / long >5min)
- Multi-select with checkboxes → "Send N to Batch" → pre-loads batch page
- 🔖 Save Search button → persists to localStorage

**🔥 Trending:**
- YouTube (search fallback) + SoundCloud
- 🔥 Trending badge on each card

**🔖 Saved Searches:**
- List of saved queries
- Re-run any saved search with one click
- Delete individual searches

---

### `/summary` — Download History + Monitor

**📥 Download History tab:**
- Stats bar: Total / Completed / In Progress
- Full list: title, resolution, format ID, timestamp, status badge
- Dark mode support on all cards
- "Clear History" wipes localStorage

**🔖 Saved Searches tab:**
- Per-query monitoring toggle (pause/resume)
- "Last checked: X min ago" timestamp
- "N new" badge when unseen results detected
- Expand row → view 3 latest cached results with thumbnails + Download button
- "Search" button → opens SearchHub with query pre-filled
- Delete saved search
- Banner warning if desktop notifications aren't enabled

---

### `/settings` — Settings

| Setting | How it works |
|---|---|
| **Download Directory** | `showDirectoryPicker()` API or manual path input. Saved to localStorage. Sent as `download_dir` on every download. Empty = temp folder (streams to browser). |
| **Default Format** | Preference stored in localStorage. |
| **Theme** | Light/Dark applied instantly to `<html>` class. Persists without saving. |
| **Notifications** | `Notification.requestPermission()` on toggle. Test button available. Required for saved-search alerts. |

---

### `components/AppShell.tsx`

Invisible client component mounted once in the root layout. Activates all app-wide background hooks:
- `useSavedSearchesMonitor()` — checks saved searches every 5 min, fires notifications on new results

---

### `components/ChatDrawer.tsx` — AI Assistant

Floating 🤖 button → slide-out drawer from right side.

**Features:**
- 🎤 Web Speech API microphone (red pulse when listening)
- Text input with Enter to send
- Message history with alternating user/bot bubbles
- Inline search results (scrollable, all results shown, no 4-result cap)
- Real-time download progress bar inside chat bubble

**Workflow (download):**
```
1. POST /chat → parse intent server-side
2. If not URL → POST /search (find top result)
3. POST /inspect → get metadata
4. POST /list-formats → get formats
5. POST /ai/recommend → pick best format
   (overridden if user said "as MP3" or "in 720p")
6. POST /download → SSE stream with live progress
7. GET /serve-file → trigger browser download
```

**Fallback:** If `/chat` is unreachable, client-side `parseIntent()` handles NLP.

---

### `components/TrimSlider.tsx`

Dual-handle range slider for video trimming:
- Visual track with colored selection range
- Start/End HH:MM:SS text inputs (validated on blur)
- Duration display: "selecting X:XX:XX"
- Clear button resets trim

---

### `hooks/useSavedSearchesMonitor.ts`

Background hook (activated via AppShell):
- Runs first check after 30s, then every 5 min
- Reads `novaDvrSavedSearches` from localStorage
- Checks up to 10 enabled queries against `/search`
- Tracks seen video IDs in `novaDvrSeenMediaIds` (keeps last 500)
- Fires `Notification` for first new item per query per cycle
- Writes results + timestamps to `novaDvrMonitor` localStorage key

---

### `lib/fetchWithRetry.ts`

Resilient fetch utility available to all pages:
- Per-request `AbortController` timeout (default 30s)
- Up to 2 retries with exponential back-off (800ms base)
- No retry on 4xx (client errors won't self-resolve)
- Forwards external `AbortSignal` (cancel from calling code)
- Typed errors: `FetchTimeoutError`, `FetchNetworkError`

---

## 10. AI Features

All AI features are **rule-based** — no external API keys required.

| Feature | Endpoint | Trigger | Output |
|---|---|---|---|
| Content Summary | `POST /ai/summarize` | Auto after inspect | Violet 🤖 banner in meta card |
| Format Recommendation | `POST /ai/recommend` | Auto after formats load | Violet 🤖 banner + "Use suggestion" |
| Error Explanation | `POST /ai/explain-error` | Auto on download failure | Amber 🤖 banner below error |
| Category Clustering | `POST /ai/cluster` | Auto after search results | Filter pills above results grid |
| NLP Intent Parser | `POST /chat` | Every chat message | Structured `{ intent, platform, query, format }` |

---

## 11. Voice Assistant & Chat

### Intent Detection (`POST /chat`)

| Intent | Example phrases | Action |
|---|---|---|
| `search` | "Search for lofi on YouTube" | Runs search, shows results inline |
| `download` | "Download as MP3", "Get 1080p" | Full inspect→formats→download pipeline |
| `trending` | "Show trending on SoundCloud" | Loads trending content |
| `history` | "What did I download?" | Shows last 5 jobs from localStorage |
| `unknown` | Anything unrecognized | Falls back to search |

**Format hints extracted:** `mp3` · `audio` · `4k` · `1080p` · `720p` · `480p` · `360p` · `hd` · `best`

**Platform detection:** `youtube`/`yt` · `soundcloud`/`sc` · `bilibili` · `facebook`/`fb` · `instagram`/`ig` · `tiktok` · `twitter`/`x`

---

## 12. Advanced Download Options

### Video Trimming
- Dual-handle slider + HH:MM:SS inputs
- Routed to `POST /download-with-options` with `start_time` + `end_time`
- Backend uses `yt_dlp.utils.download_range_func` + `force_keyframes_at_cuts`

### Subtitles
- `POST /subtitles` called after formats load, sends `preferred_lang: navigator.language`
- Backend scores tracks: exact → base language → English → first available
- `recommended_lang` auto-selected in dropdown with "Auto-detected" green badge
- Options: embed in MP4 or save as separate `.srt` / `.vtt` / `.ass`

### Smart Paste
- Regex extracts all `https://...` URLs from any pasted text
- Auto-triggers when 2+ URLs detected in paste event
- Deduplicates before adding to queue

### Playlist Exploder
- `POST /playlist-explode` → returns `is_playlist` flag + item array
- Individual items get title/thumbnail pre-loaded
- Each item has a checkbox — uncheck to exclude before batch download
- Supports: YouTube playlists, YouTube channel latest uploads, SoundCloud albums, Bilibili playlists

---

## 13. Feature Workflows

### Single Download — Full Flow

```
User pastes URL → Inspect URL
      ↓
POST /inspect (cached 5 min)
→ Meta card: thumbnail, title, platform, duration, views, date
→ 🤖 POST /ai/summarize → violet summary banner
      ↓
"Check Available Formats"
      ↓
POST /list-formats (cached 5 min)
→ Video tiles + Audio tiles
→ 🤖 POST /ai/recommend → suggestion banner
→ POST /subtitles → auto-detect language, pre-select
      ↓
User selects format (or clicks "Use suggestion")
Optionally: enable Trim slider or Subtitle options
      ↓
"Download"
→ [First time] DownloadLocationModal
→ POST /download (or /download-with-options)
   → Semaphore acquired (max 5 concurrent)
   → Thread spawned → yt-dlp runs (retry on transient errors)
   → SSE events: downloading → processing → done
   → Progress bar updates live
      ↓
GET /serve-file?path=...&temp=1
→ Browser Downloads panel opens
→ Temp file deleted from server
→ Desktop notification fires
→ Job written to localStorage → visible in /summary
```

### Chat Download — Full Flow

```
User types "download lofi hip hop as mp3"
      ↓
POST /chat → { intent: "download", query: "lofi hip hop", format: { is_audio: true } }
      ↓
POST /search { query, platform: "youtube", limit: 1 }
→ Gets top result URL
      ↓
POST /inspect → metadata
POST /list-formats → formats
POST /ai/recommend → best format
→ Format overridden by user hint (is_audio: true → picks best MP3)
      ↓
POST /download → SSE stream
→ Progress shown in chat bubble
→ GET /serve-file → browser download triggered
→ Job saved to localStorage
```

### SearchHub → Batch Flow

```
User searches → results grid
→ /ai/cluster called → category pills appear
→ User selects multiple cards (checkbox on thumbnail)
→ "Send N to Batch" → sessionStorage.novaDvrBatchUrls
→ router.push("/batch")
→ Batch page reads URLs → adds to queue
→ "Fetch All Formats" → formats loaded for all
→ Apply global preset → "Download (N)"
```

---

## 14. Settings & Persistence

| Key | Storage | Contents |
|---|---|---|
| `novaDvrSettings` | localStorage | `{ directory, defaultFormat, theme, notifications }` |
| `novaDvrJobs` | localStorage | Array of download history jobs |
| `novaDvrSavedSearches` | localStorage | Array of saved search query strings |
| `novaDvrMonitor` | localStorage | `{ [query]: { enabled, lastChecked, newCount, latestItems } }` |
| `novaDvrSeenMediaIds` | localStorage | Array of seen video IDs (last 500) |
| `novaDvrBatchUrls` | sessionStorage | URLs passed from SearchHub to Batch |

---

## 15. Stability & Reliability

### Backend

| Feature | Detail |
|---|---|
| **Concurrency limiter** | `threading.Semaphore(5)` — max 5 simultaneous downloads. 6th request gets immediate SSE error instead of blocking. |
| **Metadata cache** | In-memory dict with 5-min TTL. `/inspect`, `/list-formats`, `/search` all cached. Eviction runs on `/health` call. |
| **Download retry** | Up to 2 retries with exponential back-off (1s, 2s). Permanent errors (private, geo-blocked, copyright, live stream, members-only) skip retry immediately. |
| **Socket timeout** | All yt-dlp calls use `socket_timeout: 20-30s` — no infinite hangs on slow connections. |
| **Temp file cleanup** | Files older than 30 min auto-deleted at startup via `_cleanup_old_temp_files()`. |
| **Structured logging** | `INFO`-level logger on all endpoints. Errors log URL + context. Warning logged on retry attempts. |
| **Health endpoint** | `GET /health` returns `status`, `cache_entries`, `active_downloads`. |

### Frontend

| Feature | Detail |
|---|---|
| **fetchWithRetry** | `app/lib/fetchWithRetry.ts` — 30s timeout, 2 retries with back-off, AbortSignal support, typed errors. |
| **AppShell** | Invisible client component in layout — hosts background hooks without polluting page components. |
| **Stale closure fix** | ChatDrawer captures bot message index inside `setMessages` updater (not from stale closure) — prevents download workflow getting stuck. |
| **Duplicate key fix** | Search result cards use `${r.id}-${idx}` as key — handles duplicate IDs returned by YouTube. |

---

## 16. Supported Platforms

Nova DVR supports **1000+ platforms** via yt-dlp. Key ones shown in the SupportedSites grid:

YouTube, Instagram, Facebook, TikTok, X/Twitter, Vimeo, SoundCloud, Twitch, Dailymotion, Reddit, Bilibili, Rumble, Odysee, Pinterest, LinkedIn, Snapchat, Streamable, Bandcamp, Mixcloud, Spotify, Apple Music, Deezer, Niconico, VK, OK.ru, Weibo, Youku, Naver TV, Kakao TV, AbemaTV, Crunchyroll, Funimation, Nebula, Peertube, Loom, Wistia, Dropbox, Google Drive, BBC iPlayer, CNN, NBC, CBS, Fox News, ESPN, 9GAG, Imgur — and many more.

**Search supported:** YouTube · SoundCloud · Bilibili
**Direct URL only:** Facebook · Instagram · TikTok · X/Twitter

---

## 17. Known Limits

| Limit | Detail |
|---|---|
| YouTube search cap | ~20 results max regardless of requested limit (Google API restriction) |
| YouTube trending | Direct trending feed requires login since 2024 — uses popular search as fallback |
| Max concurrent downloads | 5 (backend semaphore) |
| Playlist explode cap | 50 items per call |
| Saved search monitor | Checks top 10 enabled queries per cycle |
| Subtitle auto-detection | Only works for videos that have subtitle tracks on the platform |
| 4K download | Downloads at best available quality (platform may not always have true 4K) |
| Live streams | Cannot download active live streams — wait for recording |

---

## 18. Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | `frontend/.env.local` | Full URL of the Flask backend, e.g. `http://localhost:5000` |

No other environment variables are required. All AI features run locally without API keys.
