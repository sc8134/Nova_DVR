/**
 * fetchWithRetry — resilient fetch wrapper
 *
 * Features:
 *  - Per-request AbortController timeout (default 30 s)
 *  - Automatic retry with exponential back-off on network errors and 5xx responses
 *  - No retry on 4xx (client errors — retrying won't help)
 *  - External AbortSignal support (cancel from calling code)
 */

export interface FetchOptions extends RequestInit {
  /** Request timeout in milliseconds. Default: 30 000 */
  timeoutMs?: number;
  /** Number of additional retry attempts on transient failure. Default: 2 */
  retries?: number;
  /** Base back-off delay in ms (doubles each retry). Default: 800 */
  backoffMs?: number;
}

export class FetchTimeoutError extends Error {
  constructor(url: string, ms: number) {
    super(`Request to ${url} timed out after ${ms}ms`);
    this.name = "FetchTimeoutError";
  }
}

export class FetchNetworkError extends Error {
  constructor(url: string, cause: unknown) {
    super(`Network error fetching ${url}: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = "FetchNetworkError";
  }
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 30_000,
    retries = 2,
    backoffMs = 800,
    signal: externalSignal,
    ...fetchOpts
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Each attempt gets its own timeout controller
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // If the caller passed an external signal, forward its abort
    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener("abort", onExternalAbort);

    try {
      const res = await fetch(url, { ...fetchOpts, signal: controller.signal });

      // Don't retry client errors (4xx) — they won't self-resolve
      if (res.status >= 400 && res.status < 500) return res;

      // Retry on server errors (5xx)
      if (res.status >= 500) {
        lastError = new Error(`Server error ${res.status} from ${url}`);
        if (attempt < retries) {
          await _sleep(backoffMs * Math.pow(2, attempt));
          continue;
        }
        return res; // return it anyway so caller can inspect
      }

      return res; // success

    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        if (externalSignal?.aborted) throw err; // caller cancelled — don't retry
        throw new FetchTimeoutError(url, timeoutMs);
      }
      lastError = new FetchNetworkError(url, err);
      if (attempt < retries) {
        await _sleep(backoffMs * Math.pow(2, attempt));
      }
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener("abort", onExternalAbort);
    }
  }

  throw lastError ?? new FetchNetworkError(url, "unknown");
}

function _sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
