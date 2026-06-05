/**
 * Safely parse a fetch Response as JSON.
 * If the response is HTML (Render cold-start page, Vercel error page, etc.)
 * throws a descriptive error instead of "Unexpected token '<'".
 */
export async function safeJson(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new Error(
      `Backend returned an HTML page (status ${res.status}). ` +
      `The server may be starting up — please wait 30 seconds and try again.`
    );
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Backend returned invalid JSON (status ${res.status}). ` +
      `Response: ${text.slice(0, 120)}`
    );
  }
}
