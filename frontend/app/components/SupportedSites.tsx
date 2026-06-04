"use client";

import Image from "next/image";
import { useState } from "react";

// yt-dlp major supported sites with Google favicon service
const SITES = [
  { name: "YouTube",       domain: "youtube.com" },
  { name: "Instagram",     domain: "instagram.com" },
  { name: "Facebook",      domain: "facebook.com" },
  { name: "TikTok",        domain: "tiktok.com" },
  { name: "X / Twitter",   domain: "x.com" },
  { name: "Vimeo",         domain: "vimeo.com" },
  { name: "SoundCloud",    domain: "soundcloud.com" },
  { name: "Twitch",        domain: "twitch.tv" },
  { name: "Dailymotion",   domain: "dailymotion.com" },
  { name: "Reddit",        domain: "reddit.com" },
  { name: "Bilibili",      domain: "bilibili.com" },
  { name: "Rumble",        domain: "rumble.com" },
  { name: "Odysee",        domain: "odysee.com" },
  { name: "Pinterest",     domain: "pinterest.com" },
  { name: "LinkedIn",      domain: "linkedin.com" },
  { name: "Snapchat",      domain: "snapchat.com" },
  { name: "Streamable",    domain: "streamable.com" },
  { name: "Bandcamp",      domain: "bandcamp.com" },
  { name: "Mixcloud",      domain: "mixcloud.com" },
  { name: "Spotify",       domain: "spotify.com" },
  { name: "Apple Music",   domain: "music.apple.com" },
  { name: "Deezer",        domain: "deezer.com" },
  { name: "Niconico",      domain: "nicovideo.jp" },
  { name: "VK",            domain: "vk.com" },
  { name: "OK.ru",         domain: "ok.ru" },
  { name: "Weibo",         domain: "weibo.com" },
  { name: "Youku",         domain: "youku.com" },
  { name: "Naver TV",      domain: "tv.naver.com" },
  { name: "Kakao TV",      domain: "tv.kakao.com" },
  { name: "AbemaTV",       domain: "abema.tv" },
  { name: "Crunchyroll",   domain: "crunchyroll.com" },
  { name: "Funimation",    domain: "funimation.com" },
  { name: "Nebula",        domain: "nebula.tv" },
  { name: "Peertube",      domain: "joinpeertube.org" },
  { name: "Loom",          domain: "loom.com" },
  { name: "Wistia",        domain: "wistia.com" },
  { name: "Dropbox",       domain: "dropbox.com" },
  { name: "Google Drive",  domain: "drive.google.com" },
  { name: "BBC iPlayer",   domain: "bbc.co.uk" },
  { name: "CNN",           domain: "cnn.com" },
  { name: "NBC",           domain: "nbc.com" },
  { name: "CBS",           domain: "cbsnews.com" },
  { name: "Fox News",      domain: "foxnews.com" },
  { name: "ESPN",          domain: "espn.com" },
  { name: "9GAG",          domain: "9gag.com" },
  { name: "Imgur",         domain: "imgur.com" },
];

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

interface Props {
  onSiteClick?: (domain: string) => void;
}

export default function SupportedSites({ onSiteClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? SITES : SITES.slice(0, 20);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Supported Sites
          </span>
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
            {SITES.length}+ platforms
          </span>
        </div>
        <a
          href="https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline"
        >
          Full list →
        </a>
      </div>

      {/* Sites grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {visible.map((site) => (
            <button
              key={site.domain}
              type="button"
              onClick={() => onSiteClick?.(site.domain)}
              title={`Paste a ${site.name} URL in the input above`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm transition text-left group"
            >
              <Image
                src={favicon(site.domain)}
                alt={site.name}
                width={16}
                height={16}
                className="rounded-sm shrink-0"
                unoptimized
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate transition">
                {site.name}
              </span>
            </button>
          ))}
        </div>

        {/* Show more / less */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 w-full text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition py-1"
        >
          {expanded ? "▲ Show less" : `▼ Show all ${SITES.length} platforms`}
        </button>
      </div>
    </div>
  );
}
