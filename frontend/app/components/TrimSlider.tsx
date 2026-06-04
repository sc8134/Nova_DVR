"use client";

import { useState } from "react";

interface Props {
  duration: number | null;  // seconds
  onChange: (start: string, end: string) => void;
  onClear: () => void;
}

function secToHMS(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function hmsParse(hms: string): number {
  const parts = hms.split(":").map(Number);
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
  if (parts.length === 2) return parts[0]*60 + parts[1];
  return parts[0] || 0;
}

export default function TrimSlider({ duration, onChange, onClear }: Props) {
  const max = duration || 600;
  const [start, setStart] = useState(0);
  const [end,   setEnd]   = useState(max);
  const [startInput, setStartInput] = useState("00:00:00");
  const [endInput,   setEndInput]   = useState(secToHMS(max));

  const update = (s: number, e: number) => {
    const clampedS = Math.max(0, Math.min(s, e - 1));
    const clampedE = Math.min(max, Math.max(e, s + 1));
    setStart(clampedS); setEnd(clampedE);
    setStartInput(secToHMS(clampedS));
    setEndInput(secToHMS(clampedE));
    onChange(secToHMS(clampedS), secToHMS(clampedE));
  };

  const pct = (v: number) => `${Math.round((v / max) * 100)}%`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">✂️ Trim Range</p>
        <button onClick={onClear} className="text-xs text-slate-400 hover:text-red-500 transition">Clear</button>
      </div>

      {/* Track */}
      <div className="relative h-2 bg-slate-200 dark:bg-slate-600 rounded-full mx-2">
        {/* Selected range */}
        <div className="absolute h-2 bg-blue-500 rounded-full"
          style={{ left: pct(start), width: pct(end - start) }} />
        {/* Start handle */}
        <input type="range" min={0} max={max} value={start}
          onChange={(e) => update(Number(e.target.value), end)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        {/* End handle (overlaid) */}
        <input type="range" min={0} max={max} value={end}
          onChange={(e) => update(start, Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>

      {/* Time inputs */}
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] text-slate-400 dark:text-slate-500">Start</label>
          <input type="text" value={startInput}
            onChange={(e) => setStartInput(e.target.value)}
            onBlur={() => { const s = hmsParse(startInput); update(s, end); }}
            className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <span className="text-slate-400 text-sm mt-4">→</span>
        <div className="flex-1 space-y-1">
          <label className="text-[10px] text-slate-400 dark:text-slate-500">End</label>
          <input type="text" value={endInput}
            onChange={(e) => setEndInput(e.target.value)}
            onBlur={() => { const e = hmsParse(endInput); update(start, e); }}
            className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          {secToHMS(end - start)}
        </div>
      </div>

      {duration && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Video duration: {secToHMS(duration)} — selecting {secToHMS(end - start)}
        </p>
      )}
    </div>
  );
}
