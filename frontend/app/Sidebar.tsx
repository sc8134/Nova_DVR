"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useBackendStatus } from "./hooks/useBackendStatus";
import WalletBar from "./components/WalletBar";

const navItems = [
  {
    href: "/",
    label: "Downloader",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    href: "/batch",
    label: "Batch",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
  {
    href: "/searchhub",
    label: "SearchHub",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
      </svg>
    ),
  },
  {
    href: "/summary",
    label: "Summary",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.826a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>
    ),
  },
  {
    href: "/blog",
    label: "Blog",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
  },
];

/* ── Status dot ───────────────────────────────────────────────────────────── */
function StatusDot({ status }: { status: string }) {
  const color =
    status === "online"   ? "bg-green-400" :
    status === "warming"  ? "bg-amber-400 animate-pulse" :
    status === "checking" ? "bg-slate-400 animate-pulse" :
                             "bg-red-400";
  return <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color}`} title={`Backend: ${status}`} />;
}

/* ── Sidebar inner content (shared between mobile + desktop) ─────────────── */
function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { status, recheck } = useBackendStatus();

  return (
    <div className="relative flex flex-col h-full">

      {/* ── Logo ── */}
      <div className="px-4 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-950 ring-2 ring-white/20 shadow-lg shadow-black/50">
            <Image src="/nova_logo.png" alt="Nova DVR logo" fill className="object-contain p-0.5" priority />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-tight tracking-wide">
              Nova <span className="text-orange-400">DVR</span>
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Media Downloader</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5"
        aria-label="Main navigation"
      >
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.12em] px-3 mb-2.5">
          Menu
        </p>

        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              aria-current={active ? "page" : undefined}
              className={[
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-150 relative",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/8",
              ].join(" ")}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r-full" aria-hidden="true" />
              )}

              <span className={[
                "shrink-0 transition-colors",
                active ? "text-blue-300" : "text-slate-500 group-hover:text-slate-300",
              ].join(" ")}>
                {icon}
              </span>

              <span className="flex-1 truncate">{label}</span>

              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Wallet Bar ── */}
      <WalletBar />

      {/* ── Footer ── */}
      <div className="shrink-0 px-3 py-3.5 border-t border-white/10">
        {/* Backend status banner */}
        {(status === "warming" || status === "offline") && (
          <div className={[
            "mb-2.5 flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-semibold border",
            status === "warming"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
              : "bg-red-500/10 border-red-500/20 text-red-300",
          ].join(" ")}
            role="status"
            aria-live="polite"
          >
            {status === "warming" ? (
              <svg className="w-3 h-3 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" aria-hidden="true" />
            )}
            <span className="flex-1 truncate">
              {status === "warming" ? "Backend warming up…" : "Backend offline"}
            </span>
            <button
              onClick={recheck}
              className="underline underline-offset-2 hover:text-white transition whitespace-nowrap"
              aria-label="Retry backend connection"
            >
              retry
            </button>
          </div>
        )}

        {/* App info row */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-slate-950 ring-1 ring-white/20 shrink-0">
            <Image src="/nova_logo.png" alt="" fill className="object-contain p-0.5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-slate-300 truncate">
                Nova <span className="text-orange-400">DVR</span>
              </p>
              <StatusDot status={status} />
            </div>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">
              by{" "}
              <a
                href="https://sagarrc.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition"
              >
                Sagar RC
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Background style ─────────────────────────────────────────────────────── */
const sidebarBg = {
  backgroundImage: "url('/sidebar-background.png')",
  backgroundSize:  "100% 100%",
  backgroundPosition: "top left",
  backgroundRepeat: "no-repeat",
};

/* ── Main Sidebar export ─────────────────────────────────────────────────── */
export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-950 ring-1 ring-white/20 shrink-0">
            <Image src="/nova_logo.png" alt="Nova DVR" fill className="object-contain p-0.5" priority />
          </div>
          <p className="font-extrabold text-white text-sm tracking-wide">
            Nova <span className="text-orange-400">DVR</span>
          </p>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer backdrop ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ──────────────────────────────────────────── */}
      <div
        id="mobile-sidebar"
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        className={[
          "md:hidden fixed top-0 left-0 h-full w-72 z-50 text-white flex flex-col overflow-hidden",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={sidebarBg}
      >
        <div className="absolute inset-0 bg-black/65 pointer-events-none" aria-hidden="true" />

        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
          className="relative z-10 self-end m-3 w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative z-10 flex-1 overflow-hidden">
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside
        className="hidden md:flex w-60 shrink-0 text-white flex-col h-screen sticky top-0 z-10 overflow-hidden relative"
        style={sidebarBg}
        aria-label="Main navigation"
      >
        <div className="absolute inset-0 bg-black/65 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
