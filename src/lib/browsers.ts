import { BrowserIdentifier } from "./types";
import { DEFAULT_BROWSER_MARKER, PROMPT_MARKER, parseBrowserIdentifier } from "./velja";

const BROWSER_NAME_BY_BUNDLE_ID: Record<string, string> = {
  "com.apple.Safari": "Safari",
  "com.google.Chrome": "Chrome",
  "com.google.Chrome.beta": "Chrome Beta",
  "com.google.Chrome.canary": "Chrome Canary",
  "com.microsoft.edgemac": "Microsoft Edge",
  "com.microsoft.edgemac.Beta": "Microsoft Edge Beta",
  "com.microsoft.edgemac.Dev": "Microsoft Edge Dev",
  "org.mozilla.firefox": "Firefox",
  "org.mozilla.nightly": "Firefox Nightly",
  "org.mozilla.firefoxdeveloperedition": "Firefox Developer Edition",
  "com.brave.Browser": "Brave",
  "com.brave.Browser.beta": "Brave Beta",
  "com.brave.Browser.nightly": "Brave Nightly",
  "com.vivaldi.Vivaldi": "Vivaldi",
  "company.thebrowser.Browser": "Arc",
  "ai.perplexity.comet": "Comet",
  "net.imput.helium": "Helium",
  "com.kagi.kagimacOS": "Kagi Browser",
};

export function getBrowserName(bundleId: string): string {
  return BROWSER_NAME_BY_BUNDLE_ID[bundleId] ?? bundleId;
}

export function getBrowserSubtitle(identifier: string): string {
  if (identifier === PROMPT_MARKER) {
    return "Velja prompt";
  }

  if (identifier === DEFAULT_BROWSER_MARKER) {
    return "System default browser";
  }

  const parsed = parseBrowserIdentifier(identifier);
  return parsed.profile ? `Profile: ${parsed.profile}` : parsed.bundleId;
}

export function getBrowserTitle(identifier: string): string {
  if (identifier === PROMPT_MARKER) {
    return "Prompt";
  }

  if (identifier === DEFAULT_BROWSER_MARKER) {
    return "System Default Browser";
  }

  const parsed = parseBrowserIdentifier(identifier);
  const browserName = getBrowserName(parsed.bundleId);
  return parsed.profile ? `${browserName} (${parsed.profile})` : browserName;
}

export function parseIdentifier(identifier: string): BrowserIdentifier {
  return parseBrowserIdentifier(identifier);
}
