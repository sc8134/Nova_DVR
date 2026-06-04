"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Downloader",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    href: "/batch",
    label: "Batch",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
  {
    href: "/searchhub",
    label: "SearchHub",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
      </svg>
    ),
  },
  {
    href: "/summary",
    label: "Summary",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.826a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 shrink-0 text-white flex flex-col h-screen sticky top-0 z-10 overflow-hidden relative"
      style={{
        backgroundImage: "url('/sidebar background.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "top left",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay — no blur so the image stays crisp */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* All content sits above the overlay */}
      <div className="relative flex flex-col h-full">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Logo with solid dark ring so it pops against any background */}
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-slate-950 ring-2 ring-white/20 shadow-xl shadow-black/60">
            <Image
              src="/nova_logo.png"
              alt="Nova DVR"
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div>
            <p className="font-extrabold text-white text-base leading-tight tracking-wide drop-shadow-md">
              Nova <span className="text-orange-400">DVR</span>
            </p>
            <p className="text-xs text-slate-300 drop-shadow-sm">Media Downloader</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/60"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className={active ? "text-white" : "text-slate-400"}>
                {icon}
              </span>
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-1">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-slate-950 ring-1 ring-white/20 shrink-0">
            <Image
              src="/nova_logo.png"
              alt="Nova DVR"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              Nova <span className="text-orange-400">DVR</span>
            </p>
            <p className="text-xs text-slate-400">
              Built by{" "}
              <a
                href="https://sagarrc.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-200 underline underline-offset-2 transition"
              >
                Sagar RC
              </a>
            </p>
          </div>
        </div>
      </div>

      </div>
    </aside>
  );
}
