/**
 * Central backend URL config.
 * Falls back to the production Railway URL if the env var is not set.
 */
export const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  "https://api.novadvr.sagarrc.com.np";
