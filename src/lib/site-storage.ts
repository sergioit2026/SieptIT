import type { SiteConfig } from "./site-config";

export const SITE_CONFIG_STORAGE_KEY = "siept-site-config";

export function isSiteConfig(value: unknown): value is SiteConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    typeof v.slug === "string" &&
    typeof v.identity === "object" &&
    v.identity !== null &&
    typeof v.layoutId === "string" &&
    typeof v.theme === "object" &&
    v.theme !== null
  );
}

export function saveSiteConfig(config: SiteConfig): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(config);
  try {
    window.localStorage.setItem(SITE_CONFIG_STORAGE_KEY, raw);
  } catch {
    /* quota / private mode */
  }
  try {
    window.sessionStorage.setItem(SITE_CONFIG_STORAGE_KEY, raw);
  } catch {
    /* ignore */
  }
}

export function loadSiteConfig(): SiteConfig | null {
  if (typeof window === "undefined") return null;
  for (const store of [window.sessionStorage, window.localStorage]) {
    try {
      const raw = store.getItem(SITE_CONFIG_STORAGE_KEY);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (isSiteConfig(parsed)) return parsed;
    } catch {
      /* continue */
    }
  }
  return null;
}

/** Encode config for URL query (compact). Returns null if too large. */
export function encodeConfigForQuery(config: SiteConfig): string | null {
  try {
    const json = JSON.stringify(config);
    const b64 =
      typeof window !== "undefined"
        ? btoa(unescape(encodeURIComponent(json)))
        : Buffer.from(json, "utf8").toString("base64");
    if (b64.length > 6000) return null;
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return null;
  }
}

export function decodeConfigFromQuery(encoded: string): SiteConfig | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const b64 = padded + pad;
    const json =
      typeof window !== "undefined"
        ? decodeURIComponent(escape(atob(b64)))
        : Buffer.from(b64, "base64").toString("utf8");
    const parsed: unknown = JSON.parse(json);
    return isSiteConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function previewPath(slug: string): string {
  const safe = (slug || "site").replace(/[^a-z0-9-]/gi, "-") || "site";
  return `/preview/${safe}`;
}
