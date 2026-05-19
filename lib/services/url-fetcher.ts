// CR-003: URL fetcher — fetches a URL and extracts readable text content.
// Used to inject reference context into the brief extraction pipeline.

const MAX_CHARS = 3000;

function extractText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "CreativeBriefBot/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return null;
    }
    const html = await res.text();
    const text = extractText(html);
    return text.slice(0, MAX_CHARS);
  } catch {
    return null;
  }
}

export function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)>\]"']+/g) ?? [];
  return [...new Set(matches)].slice(0, 3); // max 3 URLs per message
}
