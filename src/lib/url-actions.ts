import { spawnSync } from "node:child_process";
import { runShortcut } from "./shortcuts";
import { parseBrowserIdentifier } from "./velja";

const TRACKING_PARAMETERS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "dclid",
  "fbclid",
  "mc_cid",
  "mc_eid",
];

/**
 * Normalizes a URL string for use with Velja and the system `open` command.
 *
 * - If the input already has an `http://` or `https://` scheme it is preserved as-is.
 * - If no scheme is present the URL defaults to HTTPS (e.g. `"example.com"` →
 *   `"https://example.com"`). Use an explicit `http://` prefix for plain-HTTP
 *   endpoints such as local development servers (e.g. `"http://localhost:3000"`).
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  // Preserve existing http/https scheme; bare URLs (no scheme) default to https.
  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(normalized);
  return url.toString();
}

export function openUrlWithVelja(inputUrl: string): void {
  const url = normalizeUrl(inputUrl);
  const result = spawnSync("open", [url], { encoding: "utf8" });

  if (result.status !== 0) {
    const error = result.stderr.trim() || `Could not open URL: ${url}`;
    throw new Error(error);
  }
}

export function openUrlInBrowser(inputUrl: string, browserIdentifier: string): void {
  const url = normalizeUrl(inputUrl);
  const { bundleId } = parseBrowserIdentifier(browserIdentifier);
  const result = spawnSync("open", ["-b", bundleId, url], { encoding: "utf8" });

  if (result.status !== 0) {
    const error = result.stderr.trim() || `Could not open URL in ${bundleId}`;
    throw new Error(error);
  }
}

export function openUrlInBrowserProfile(inputUrl: string, browserIdentifier: string): void {
  const url = normalizeUrl(inputUrl);

  try {
    runShortcut("Open Browser Profile", JSON.stringify({ browser: browserIdentifier, url }));
    return;
  } catch {
    openUrlInBrowser(url, browserIdentifier);
  }
}

export function removeTrackingParameters(inputUrl: string): string {
  const normalizedUrl = normalizeUrl(inputUrl);

  try {
    const shortcutOutput = runShortcut("Remove Tracking Parameters", normalizedUrl);
    if (shortcutOutput.trim()) {
      return shortcutOutput.trim();
    }
  } catch {
    // Fall back to local cleanup when shortcuts are unavailable.
  }

  const url = new URL(normalizedUrl);

  for (const param of TRACKING_PARAMETERS) {
    url.searchParams.delete(param);
  }

  return url.toString();
}
