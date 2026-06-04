/**
 * Central backend URL config.
 * Falls back to the production Render URL if the env var is not set.
 * This ensures the app works even if NEXT_PUBLIC_BACKEND_URL is missing
 * from the Vercel build environment.
 */
export const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  "https://nova-dvr.onrender.com";
