"use client";

const BADGES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.38 11.37c.023.666.067 1.328.13 1.987a11.964 11.964 0 003.195 7.044A11.965 11.965 0 0012 24c2.938 0 5.636-1.06 7.694-2.806.33-.276.644-.57.942-.877a11.966 11.966 0 002.984-7.917c0-.298-.01-.594-.028-.887A11.956 11.956 0 0020.4 6a11.96 11.96 0 00-8.4-3.036z" />
      </svg>
    ),
    label: "Secure",
    desc: "No data stored",
    color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    label: "Fast",
    desc: "Direct streams",
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    label: "Trusted",
    desc: "By creators",
    color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
    label: "Open Source",
    desc: "Fully transparent",
    color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800",
  },
];

const TESTIMONIALS = [
  {
    name: "Alex M.",
    role: "Video Creator",
    avatar: "AM",
    avatarColor: "bg-blue-500",
    text: "Finally a downloader that actually works. Grabbed a full playlist in one click — saved me hours.",
  },
  {
    name: "Priya S.",
    role: "Content Researcher",
    avatar: "PS",
    avatarColor: "bg-violet-500",
    text: "The MP3 export is clean and fast. I use Nova DVR every day for podcast research.",
  },
  {
    name: "Jordan K.",
    role: "Educator",
    avatar: "JK",
    avatarColor: "bg-orange-500",
    text: "Subtitle support is a game changer. I can pull lecture videos with captions in one go.",
  },
];

const STATS = [
  { value: "1000+", label: "Supported Sites" },
  { value: "4K", label: "Max Resolution" },
  { value: "Free", label: "Forever" },
  { value: "AI", label: "Smart Format Pick" },
];

export default function TrustSection() {
  return (
    <section className="px-6 py-12 max-w-4xl mx-auto space-y-10">

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-5 px-3 shadow-sm">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Why Nova DVR</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map((b) => (
            <div key={b.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${b.color}`}>
              <span className="shrink-0">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold leading-tight">{b.label}</p>
                <p className="text-xs opacity-70">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">What people say</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2.5 pt-1">
                <div className={`w-8 h-8 rounded-full ${t.avatarColor} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
