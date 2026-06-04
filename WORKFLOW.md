# Nova DVR — Full Project Workflow

> Professional multi-platform media downloader built with **Next.js 16 + Flask + yt-dlp**
> Built by [Sagar RC](https://sagarrc.com.np)

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
14. [Download Flow — Primary vs Secondary](#14-download-flow--primary-vs-secondary)
15. [Settings & Persistence](#15-settings--persistence)
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
- Search YouTube, SoundCloud, and Bilibili directly in-app with AI category clustering
- **Smart Paste** — extract multiple URLs from any text block automatically
- **Playlist/Channel Exploder** — paste one playlist URL, auto-expand to 50+ individual items
- **Video Trimming** — select exact start/end times before downloading (HH:MM:SS slider)
- **Subtitle Embedding** — download videos with hardcoded subtitles or as separate .srt/.vtt files
- Paste direct URLs from Facebook, Instagram, TikTok, and X
- Download multiple URLs in batch with global format presets
- **Real-time Progress Streaming** — live download speed, percent, and ETA
- Files stream directly to the browser → saved to the system Downloads folder
- **Saved Searches** — monitor specific queries with background checks every 5 minutes + notifications
- Configure custom download directory, theme (dark/light), and desktop notifications
- Track all downloads in a history summary

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
                     │  HTTP fetch (JSON)
                     ▼
┌──────────────────────────────────────────────┐
│         Flask Backend — Port 5000            │
│                                              │
│  POST /inspect          ← validate URL       │
│  POST /list-formats     ← get quality list   │
│  POST /download         ← download + stream  │
│  GET  /serve-file       ← stream to browser  │
│  POST /batch-download   ← batch downloads    │
│  POST /search           ← search platforms   │
│  POST /ai/summarize     ← content summary    │
│  POST /ai/recommend     ← format suggestion  │
│  POST /ai/explain-error ← error translation  │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│              yt-dlp + FFmpeg                 │
│  Extracts info + downloads + merges/converts │
└────────────────────┬─────────────────────────┘
                     │
          ┌──────────┴───────────┐
          ▼                      ▼
   Temp folder               Custom dir
   (streamed to          (if user set one
    browser → system       in Settings)
    Downloads folder)
```

---

## 3. Project Structure

```
Test/
├── backend/
│   ├── app.py              # Flask API — all 6 endpoints
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              # Root layout — Sidebar + ThemeProvider
│   │   ├── page.tsx                # / — Single URL Downloader
│   │   ├── globals.css             # Tailwind v4 + dark mode (@custom-variant)
│   │   ├── Sidebar.tsx             # Navigation sidebar (client, usePathname)
│   │   ├── ThemeProvider.tsx       # Dark/light context, applies class to <html>
│   │   │
│   │   ├── batch/
│   │   │   └── page.tsx            # /batch — Batch Downloader
│   │   │
│   │   ├── searchhub/
│   │   │   └── page.tsx            # /searchhub — SearchHub
│   │   │
│   │   ├── summary/
│   │   │   └── page.tsx            # /summary — Download History
│   │   │
│   │   ├── settings/
│   │   │   └── page.tsx            # /settings — App Settings
│   │   │
│   │   └── components/
│   │       ├── SupportedSites.tsx      # 46+ platform grid with favicons
│   │       └── DownloadLocationModal.tsx  # First-run folder picker modal
│   │
│   ├── public/
│   │   └── nova_logo.png           # App logo (sidebar header + footer + favicon)
│   │
│   ├── .env.local                  # NEXT_PUBLIC_BACKEND_URL
│   ├── next.config.ts
│   ├── postcss.config.mjs
│   └── package.json
│
├── WORKFLOW.md     ← this file
└── task.md         # Feature requirements log
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
| yt-dlp | latest | Media extraction and downloading |
| FFmpeg | system | MP4 merge (video+audio streams), MP3 conversion |

---

## 5. Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **FFmpeg** — required for merging video+audio and converting to MP3

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

# Install dependencies
pip install -r requirements.txt
pip install yt-dlp              # install separately (not in requirements.txt)
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

### `POST /inspect`

Validates a URL and returns video metadata.

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

Returns deduplicated video + audio formats for a URL.

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
- Video: accepts `mp4` / `webm` / `m4v` source streams (both video-only and combined), always output as MP4. Resolutions: `144p → 4K`.
- 4K tagged as `display_only: true` — downloads at best available quality.
- Audio: any source format (m4a, webm, opus, etc.), always converted to **MP3** by FFmpeg. Grouped by bitrate bucket.
- At download time, video streams are always merged with `+bestaudio` via FFmpeg.

---

### `POST /download`

Downloads a single URL to temp folder, returns filepath for browser streaming.

**Request:**
```json
{
  "url": "https://...",
  "format_id": "137",
  "is_audio": false,
  "is_4k": false,
  "download_dir": ""
}
```

**Response:**
```json
{
  "message": "Downloaded https://...",
  "filepath": "/tmp/nova_dvr_temp/Video Title.mp4",
  "filename": "Video Title.mp4",
  "save_dir": "/tmp/nova_dvr_temp",
  "is_temp": true
}
```

**Notes:**
- `download_dir` empty → saves to system temp (`nova_dvr_temp`), `is_temp: true`
- `download_dir` set → saves there persistently, `is_temp: false`
- Frontend uses `filepath` to call `/serve-file` which streams the file to the browser
- `is_audio: true` → FFmpeg extracts audio as `.mp3` at 192kbps
- Video always merges as `.mp4` via `format_id+bestaudio[ext=m4a]/bestaudio`

---

### `POST /download-with-options`

Advanced download with trimming, subtitles, and real-time progress streaming.

**Request:**
```json
{
  "url": "https://...",
  "format_id": "137",
  "is_audio": false,
  "download_dir": "",
  "trim": {
    "start": "00:30:00",
    "end": "01:45:30"
  },
  "subtitle": {
    "enabled": true,
    "format": "srt",
    "embed": true
  }
}
```

**Response (Server-Sent Events):**
```
event: progress
data: {"percent": 45, "speed": "2.5MB/s", "eta": "3m 22s"}

event: complete
data: {"filepath": "/tmp/nova_dvr_temp/Video Title.mp4"}
```

**Notes:**
- Streams progress in real-time (percent, speed, ETA)
- `trim` object: cuts the video to specified range using FFmpeg
- `subtitle.embed: true` → hardcodes subtitles into MP4
- `subtitle.embed: false` → saves subtitles as separate `.srt` or `.vtt` file
- Automatically detects available subtitle tracks from yt-dlp

---

### `POST /subtitles`

Fetches available subtitle tracks for a URL.

**Request:**
```json
{ "url": "https://..." }
```

**Response:**
```json
{
  "subtitles": [
    { "lang": "en", "label": "English", "auto_generated": false },
    { "lang": "en-US", "label": "English (US)", "auto_generated": true },
    { "lang": "es", "label": "Spanish", "auto_generated": false }
  ]
}
```

---

### `POST /playlist-explode`

Expands a single playlist or channel URL into individual video items.

**Request:**
```json
{ "url": "https://www.youtube.com/playlist?list=..." }
```

**Response:**
```json
{
  "items": [
    {
      "url": "https://www.youtube.com/watch?v=...",
      "title": "Video 1 Title",
      "duration": 456,
      "thumbnail": "https://..."
    },
    {
      "url": "https://www.youtube.com/watch?v=...",
      "title": "Video 2 Title",
      "duration": 789,
      "thumbnail": "https://..."
    }
  ],
  "total": 47,
  "returned": 50
}
```

**Notes:**
- Returns up to 50 items per request (for performance)
- Frontend uses pagination to load additional batches if needed
- Each item can be independently selected or deselected before batch download

---

### `POST /trending`

Fetches trending content from YouTube, SoundCloud, or Bilibili.

**Request:**
```json
{ "platform": "youtube", "limit": 20 }
```

**Response:**
```json
{
  "results": [
    {
      "id": "...",
      "title": "Trending Video Title",
      "url": "https://...",
      "thumbnail": "https://...",
      "uploader": "Channel Name",
      "views": 1500000,
      "duration": 234
    }
  ],
  "platform": "youtube",
  "returned": 20
}
```

---

### `GET /serve-file`

Streams a downloaded file to the browser (triggers system download panel).

**Query params:** `?path=/full/path/to/file.mp4&temp=1`

- `temp=1` → file is deleted from server after streaming
- `temp=0` → file stays in the user's custom directory

**Effect:** Browser shows native Save/Downloads dialog. File appears in the system Downloads history.

---

### `POST /batch-download`

Downloads multiple URLs sequentially.

**Request:**
```json
{
  "download_dir": "",
  "jobs": [
    { "url": "https://...", "format_id": "137", "is_audio": false, "is_4k": false },
    { "url": "https://...", "format_id": "140", "is_audio": true,  "is_4k": false }
  ]
}
```

**Response:**
```json
{
  "results": [
    { "url": "https://...", "status": "done" },
    { "url": "https://...", "status": "error", "message": "..." }
  ],
  "download_dir": "/tmp/nova_dvr_temp"
}
```

---

### `POST /search`

Searches YouTube, SoundCloud, or Bilibili via yt-dlp.

**Request:**
```json
{ "query": "lofi hip hop", "platform": "youtube", "limit": 25 }
```

**Response:**
```json
{
  "results": [{ "id": "...", "title": "...", "url": "https://...", "thumbnail": "...", "duration": 213, "uploader": "...", "view_count": 500000 }],
  "returned": 20,
  "note": "Platform restriction — YouTube caps at ~20 results regardless of limit."
}
```

**Platform search limits:**
| Platform | Max results |
|---|---|
| YouTube | ~20 (Google API hard limit) |
| SoundCloud | ~50 |
| Bilibili | ~50 |
| Facebook, Instagram, TikTok, X | ❌ No search — direct URL only |

---

## 9. Frontend Pages & Components

### `/` — Downloader

3-step flow with URL inspection before format selection:

```
Step 1: Paste URL → "Inspect URL"
         → POST /inspect
         → Shows: thumbnail, title, uploader, platform badge, duration, views, date

Step 2: "Check Available Formats"
         → POST /list-formats
         → Video grid: 144p / 240p / 360p / 480p / 720p / 1080p / 1440p / 4K (REF)
         → Audio grid: all available bitrates as MP3
         → Click any tile to select

Step 3: "Download"
         → If no directory saved: DownloadLocationModal appears first
         → POST /download → Flask downloads to temp
         → GET /serve-file → file streams to browser → system Downloads folder
         → Notification fires, session log updates, job saved to localStorage
```

**Auto-inspect via URL param:** `/?url=https://...` — used when SearchHub sends a result to the downloader.

---

### `/batch` — Batch Downloader

```
1. Add URLs individually, paste multiple lines, or use Smart Paste (auto-extracts URLs from text)
2. [NEW] Paste a playlist URL → Playlist Exploder auto-expands to 50+ items with checkboxes
3. "Fetch" per item or "Fetch All Formats" for the entire queue
4. [NEW] Global Format Preset dropdown (top-right) — apply single rule to entire batch:
   - "Best Quality MP3" (all → 192kbps MP3)
   - "1080p MP4" (all → 1080p video+audio)
   - "720p MP4" (all → 720p)
   - "480p MP4" (all → 480p)
   - "360p MP4" (all → 360p)
5. Each item shows format dropdown (video resolutions + audio bitrates, can override preset)
6. [NEW] Real-time progress bar at top showing: "Downloading 4 of 25 — 2.5MB/s — 5m remaining"
7. Per-item progress bars showing % and speed
8. "Download All (N)" → parallel or sequential downloads with live ETA
9. Each completed download triggers a browser file save
10. Status per item: idle → fetching → ready → downloading → done / error
11. [NEW] Export queue to .json/.txt for later reload
```

---

### `/searchhub` — SearchHub

**Searchable platforms (YouTube, SoundCloud, Bilibili):**
- Type query → choose result count (12 / 25 / 50) → Search
- Results grid with thumbnail, title, uploader, views, duration, platform icon
- "Download" → navigates to `/?url=...` (auto-inspects in downloader)
- External link button → opens original URL in new tab

**Direct URL platforms (Facebook, Instagram, TikTok, X):**
- Info banner explains search is not available for these platforms
- Paste URL → "Send to Downloader" → navigates to `/?url=...`

Platform icons loaded via Google's favicon service (`google.com/s2/favicons?domain=...&sz=32`).

---

### `/summary` — Download History

- Reads `novaDvrJobs` from localStorage
- Stats bar: Total / Completed / In Progress
- Full list: URL, format, resolution, timestamp, status badge
- [NEW] Search monitoring dashboard:
  - List of saved searches with last-checked timestamp
  - "New items found" indicator when monitoring detects new results
  - Click to view newly found items
  - Toggle monitoring on/off per search
- "Clear History" wipes localStorage

---

### `/settings` — Settings

| Setting | How it works |
|---|---|
| **Download Directory** | Browse button opens native OS folder picker (`showDirectoryPicker()`), fallback to `<input webkitdirectory>`. Saved to localStorage. Sent to Flask as `download_dir` on every download. Empty = use temp folder (file streams to browser). |
| **Default Format** | Preference stored in localStorage. |
| **Theme** | Clicking Light/Dark immediately adds/removes `dark` class on `<html>`. Persists in localStorage. No save required. |
| **Notifications** | `Notification.requestPermission()` called on toggle. Fires real OS desktop notifications on download complete. Test notification button available. |

---

### `components/DownloadLocationModal`

Shown on first download if no directory is configured. Options:
- **Browse** — opens native OS folder picker
- **Type path manually** — text input
- **Use Default** — uses temp folder (file streams to browser → system Downloads)

On confirm, saves the path to `novaDvrSettings.directory` in localStorage so future downloads skip the modal.

---

### `components/SupportedSites`

Grid of 46+ yt-dlp supported platforms with real favicons. Shows first 20 with "Show all" toggle. Clicking any platform pre-fills the URL input. Appears on both `/` and `/batch`.

---

### `Sidebar.tsx`

- Dark slate (`bg-slate-900`), sticky, `h-screen`, `overflow-hidden`
- Nova DVR logo (`nova_logo.png`) in header
- Active nav item highlighted blue with dot indicator
- Nav: Downloader / Batch / SearchHub / Summary / [NEW] Chat / Settings
- Footer: Nova DVR logo + "Built by [Sagar RC](https://sagarrc.com.np)"

### `ChatDrawer.tsx` — Voice Assistant

- Accessible via sidebar "Chat" icon or floating button
- Web Speech API speech-to-text (click microphone to record)
- NLP intent detection:
  - **Search intent:** "Search YouTube for lofi hip hop" → auto-opens SearchHub with query
  - **Download intent:** "Download this as MP3" → extracts URL context and opens downloader
  - **Format intent:** "Get 1080p" → applies format selection
- Chat message history with alternating user/assistant bubbles
- Search results displayed inline with thumbnails and quick-download buttons
- Supports commands like:
  - "Search SoundCloud for synthwave"
  - "Download as Best Quality MP3"
  - "Show trending on Bilibili"
  - "What did I download yesterday?"

### `ThemeProvider.tsx`

React Context wrapping the whole app:
- Reads `novaDvrSettings.theme` from localStorage on mount
- Applies `dark` class to `document.documentElement` synchronously
- `setTheme()` applies the class immediately (no useEffect delay)
- Exposes `{ theme, setTheme }` via `useTheme()` hook

---

## 10. AI Features

All AI features run without external API keys — they use rule-based heuristics on metadata already fetched by yt-dlp.

---

### 10.1 Content Summarization

**Trigger:** Auto after URL inspection succeeds.
**Where:** Violet 🤖 banner inside the video metadata card.
**Backend:** `POST /ai/summarize`

Generates a plain-English sentence from title, uploader, duration, platform, views, and date:

> *"Never Gonna Give You Up" is a Youtube video by Rick Astley, running 3 minutes 33 seconds, uploaded on October 25, 2009, with 1.5 billion views. This appears to be a music track.*

Content type detected from title keywords (tutorial, music, gaming, podcast, trailer, etc.).

---

### 10.2 Smart Format Recommendation

**Trigger:** Auto after formats are fetched.
**Where:** Violet 🤖 banner at the top of the Format Selector with a "Use suggestion" button.
**Backend:** `POST /ai/recommend`

Reads `novaDvrJobs` from localStorage, counts most-used resolutions and types, then suggests:

- "You usually download 1080p. Suggesting the same."
- "You usually download audio. Suggesting 128kbps MP3."
- "Your preferred 720p isn't available. Suggesting 1080p instead."
- "Suggesting 1080p as a quality default." (no history)

Clicking **Use suggestion** instantly selects that format tile.

---

### 10.3 Error Explanation

**Trigger:** Auto when a download fails.
**Where:** Amber 🤖 banner below the red error message.
**Backend:** `POST /ai/explain-error`

Translates raw yt-dlp errors into plain English + fix suggestions:

| Error keywords | Plain explanation | Suggestion |
|---|---|---|
| private / login required | Video is private or age-restricted | Use yt-dlp --cookies or find public version |
| unavailable / removed | Video has been deleted | Look for a re-upload or try a VPN |
| geo / region / country | Not available in your region | Use a VPN |
| rate limit / 429 | Temporarily rate-limited by the platform | Wait a few minutes and try again |
| unsupported URL | Platform not supported by yt-dlp | Check the supported sites list |
| live / is live | Can't download an active live stream | Wait for the stream to end |
| members only | Channel membership required | Subscribe to the channel |

---

### 10.4 SearchHub AI Category Clustering

**Trigger:** After search results are returned.
**Where:** Violet filter pills above the results grid on `/searchhub`. Runs in the browser — no backend call.

Each result title is scanned for keywords to assign a category badge:

| Category | Detected keywords |
|---|---|
| 🎵 Music | music, song, track, album, remix, mv, official video, lyric |
| 🎓 Tutorial | tutorial, how to, guide, learn, lesson, course, explained |
| 🎮 Gaming | gameplay, gaming, playthrough, walkthrough, speedrun |
| 📰 News | news, breaking, update, report |
| 🎙 Podcast | podcast, interview, talk, discussion, episode |
| 📦 Review | review, unboxing, hands on, comparison, vs |
| 🎬 Trailer | trailer, teaser, preview, official trailer |
| 🎭 Vlog | vlog, day in, daily, my life |

Filter pills show counts (e.g. "🎵 Music (8) · 🎓 Tutorial (3)"). Clicking one filters the grid. "All" resets.

---

## 11. Voice Assistant & Chat

### Chat Interface

**Location:** Sidebar Chat icon or `/chat` route

**Features:**
- Speech-to-text via Web Speech API
- Microphone button (red when listening)
- Real-time transcription
- Message history with timestamps
- Search results displayed with thumbnails
- Quick-action buttons (Download, Open in new tab, Add to batch)

### Intent Detection

The voice assistant parses natural language commands:

**Search Commands:**
```
Examples:
- "Search YouTube for lo-fi hip hop"
- "Find trending on SoundCloud"
- "Show music tutorials on Bilibili"

Result: Opens SearchHub with pre-filled platform and query
```

**Download Commands:**
```
Examples:
- "Download as MP3"
- "Get 1080p"
- "Trim to 5 minutes and download"

Result: Opens downloader with format/options pre-applied
```

**Format Commands:**
```
Examples:
- "Best quality video"
- "Low bitrate audio"
- "720p"

Result: Auto-selects matching format
```

---

## 12. Advanced Download Options

### Video Trimming

**Location:** Downloader page, after format selection

**Features:**
- Dual-handle range slider showing video timeline
- Start/end time inputs (HH:MM:SS format)
- Thumbnail preview grid
- "Clear trim" button to reset

**Workflow:**
```
1. Select format tile
2. Trim slider appears below
3. Drag handles or type times (e.g., "00:30:00" to "01:45:30")
4. Download button automatically trims using FFmpeg -ss and -to
5. Output file is trimmed copy (original untouched)
```

### Subtitles

**Location:** Downloader & Batch pages, after URL inspection

**Available Actions:**
- **Embed in video:** Hardcodes subtitles into MP4 (permanent, always visible)
- **Download separately:** Saves as `.srt` or `.vtt` file (editable)
- **Auto-select language:** Defaults to browser language if available
- **Manual override:** Dropdown lists all detected subtitle tracks

**Subtitle Detection:**
- Automatic subtitles (marked as auto-generated)
- User-uploaded subtitles (community translations)
- Multiple language options

### Smart Paste

**Location:** Batch downloader URL input

**Feature:** Paste any text block → Nova DVR extracts valid URLs

**Example:**
```
Paste this:
"Hey check out this song https://www.youtube.com/watch?v=abc123
 and also https://soundcloud.com/xyz789. Here's a TikTok:
https://www.tiktok.com/@creator/video/123"

Result: Extracted URLs:
✓ https://www.youtube.com/watch?v=abc123
✓ https://soundcloud.com/xyz789
✓ https://www.tiktok.com/@creator/video/123
```

Uses regex to find URLs, validates against yt-dlp supported domains, deduplicates.

### Playlist/Channel Exploder

**Location:** Batch downloader, Smart Paste section

**Feature:** Paste a single playlist URL → auto-expands to individual items

**Example:**
```
Paste: https://www.youtube.com/playlist?list=PLxxxxx

Result:
☑ Video 1 (3:45) — https://www.youtube.com/watch?v=aaa
☑ Video 2 (5:12) — https://www.youtube.com/watch?v=bbb
☑ Video 3 (2:30) — https://www.youtube.com/watch?v=ccc
... (44 more items)

Uncheck items you don't want, apply format preset, click Download All
```

**Supports:**
- YouTube playlists (up to 50 at a time)
- YouTube channels (latest 50 uploads)
- SoundCloud albums
- Bilibili playlists

### Global Format Presets (Batch)

**Location:** Batch downloader, top-right corner

**Presets:**
| Preset | Applies to all items |
|---|---|
| Best Quality MP3 | 192kbps MP3 audio |
| 1080p MP4 | 1080p video+audio |
| 720p MP4 | 720p video+audio |
| 480p MP4 | 480p (mobile friendly) |
| 360p MP4 | 360p (lowest bandwidth) |

**Usage:**
1. Select preset dropdown
2. Click preset
3. All items instantly show selected format
4. Can still override per-item by clicking format dropdown

### Real-Time Progress Streaming

**Location:** Batch downloader & single downloader (active downloads)

**Master Progress Bar:**
```
┌─────────────────────────────────────────────┐
│ Downloading 4 of 25 files                    │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 32%
│ Speed: 2.5 MB/s | ETA: 5m 22s | 340 MB/1 GB
└─────────────────────────────────────────────┘
```

**Per-Item Progress:**
```
Video 1: ██████████░░░░░░░░░░░░░░ 45% (1.2 MB/s)
Video 2: ████████░░░░░░░░░░░░░░░░░░░ 30% (1.8 MB/s)
Video 3: idle (waiting...)
```

**Technical:**
- Uses Server-Sent Events (SSE) for real-time updates
- Backend sends progress every 500ms
- Browser displays live speed (MB/s), percent, ETA
- Graceful fallback if connection drops

### Saved Search Monitoring

**Location:** Settings page & Summary page

**Feature:** Monitor specific search queries with background checks

**Workflow:**
```
1. Search on SearchHub (e.g., "lofi hip hop")
2. Click "Save this search" button
3. Nova DVR checks every 5 minutes for NEW results
4. If new items found → Desktop notification fires
5. Click notification → view new items in Summary
```

**Settings:**
- List of all saved searches
- Last-checked timestamp per search
- "New items found" count
- Toggle monitoring on/off per search
- Delete saved search

**Use Cases:**
- Monitor favorite creators' new uploads
- Track trending topics
- Get notified of new podcast episodes
- Follow music artists for new releases

---

## 13. Feature Workflows

### Single Download — Full Flow

```
User pastes URL
      ↓
POST /inspect → metadata card appears
      ↓
POST /list-formats → video tiles (144p→4K) + audio tiles (bitrates)
      ↓
User selects format tile
      ↓
User clicks "Download"
      ↓
[First time only] DownloadLocationModal → user picks folder or uses default
      ↓
POST /download
  → Flask downloads to temp dir (or custom dir)
  → Returns { filepath, filename, is_temp }
      ↓
Frontend: GET /serve-file?path=...&temp=1
  → Flask streams file as attachment
  → Browser Downloads panel opens
  → User sees file in system Downloads
  → Temp file deleted from server after streaming
      ↓
Notification fires: "Download complete — saved to ~/Downloads"
Job written to localStorage → appears in /summary
```

---

### SearchHub → Downloader Flow

```
User searches on SearchHub
      ↓
POST /search → results grid with thumbnails
      ↓
User clicks "Download" on any card
      ↓
router.push("/?url=<encoded_url>")
      ↓
Downloader mounts, reads ?url= query param
      ↓
Auto-calls POST /inspect
      ↓
Continues normal flow from Step 2
```

---

### Theme Switch — Instant, No Save

```
User clicks "Dark Mode" tile in Settings
      ↓
setTheme("Dark") called
      ↓
applyTheme() immediately adds "dark" to <html>
      ↓
All dark: Tailwind classes activate instantly
      ↓
Saved to localStorage → persists on refresh
```

---

### Download Location Modal — First Run Only

```
User clicks "Download" with no directory saved
      ↓
DownloadLocationModal opens (fullscreen modal)
      ↓
Option A: Browse → showDirectoryPicker() → OS folder picker
Option B: Type path manually
Option C: Use Default → streams to browser, no server storage
      ↓
On confirm:
  - Path saved to localStorage (novaDvrSettings.directory)
  - Download starts immediately with chosen path
  - Future downloads skip the modal
```

---

## 14. Download Flow — Primary vs Secondary

### Primary (default — no custom directory set)
```
Flask downloads → /tmp/nova_dvr_temp/filename.mp4
      ↓
/serve-file streams file to browser as attachment
      ↓
Browser saves to system Downloads folder
      ↓
Temp file deleted from server
```

### Secondary (user configured a custom directory)
```
Flask downloads → C:/Users/you/CustomFolder/filename.mp4
      ↓
/serve-file streams file to browser as attachment
      ↓
Browser saves to system Downloads folder
      ↓
File ALSO kept in custom folder (not deleted)
```

In both cases, the file ends up in the browser's download system.

---

## 15. Settings & Persistence

`localStorage` key: `novaDvrSettings`

```json
{
  "directory": "C:/Users/you/Downloads/Videos",
  "defaultFormat": "MP4 (Video)",
  "theme": "Dark",
  "notifications": true
}
```

`localStorage` key: `novaDvrJobs`

```json
[
  {
    "url": "https://www.youtube.com/watch?v=...",
    "title": "Video Title",
    "format": "137",
    "resolution": "1080p",
    "status": "Done",
    "timestamp": "6/4/2026, 14:22:01"
  }
]
```

---

## 16. Supported Platforms

Nova DVR supports all ~1000+ yt-dlp platforms.

| Category | Platforms |
|---|---|
| Video | YouTube, Vimeo, Dailymotion, Twitch, Rumble, Odysee, Bilibili, Niconico |
| Social (search) | YouTube, SoundCloud, Bilibili |
| Social (URL only) | Instagram, TikTok, Facebook, X/Twitter, Reddit, Pinterest, Snapchat |
| Audio | SoundCloud, Bandcamp, Mixcloud |
| Streaming | Crunchyroll, Funimation, Nebula, AbemaTV |
| News/Media | BBC iPlayer, CNN, NBC, CBS, Fox News, ESPN |
| Other | 9GAG, Imgur, Loom, Wistia, Google Drive, Dropbox |

Full list: [yt-dlp supported sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

---

## 17. Known Limits

| Limit | Reason |
|---|---|
| YouTube search ≤ ~20 results | Google's internal search API hard limit |
| SoundCloud/Bilibili search ≤ ~50 | Platform API restriction |
| Facebook/Instagram/TikTok/X have no search | No public search API exposed |
| `showDirectoryPicker` unsupported in Firefox | Falls back to `<input webkitdirectory>` |
| Batch downloads are sequential | Flask is synchronous; parallel would need threading |
| Very large files may time out | Browser/Flask connection can drop on multi-GB files |

---

## 18. Environment Variables

### `frontend/.env.local`
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

Only one variable needed. All app configuration is handled via the Settings UI and persisted in `localStorage`.

---

## Quick Start

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate.bat
python app.py

# Terminal 2 — Frontend
cd frontend
npm run dev

# Open browser → http://localhost:3000
```

---

*Nova DVR v1.0.0 · Next.js 16 + Flask + yt-dlp*
*Built by [Sagar RC](https://sagarrc.com.np)*
