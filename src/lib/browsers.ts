import { spawnSync } from "node:child_process";
import { basename } from "node:path";
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

const appNameCache = new Map<string, string | null>();

function humanizeBundleId(bundleId: string): string {
  const leaf = bundleId.split(".").at(-1) ?? bundleId;
  const withSpaces = leaf.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return withSpaces.replace(/\b\w/g, (char) => char.toUpperCase());
}

function resolveInstalledBrowserName(bundleId: string): string | undefined {
  if (appNameCache.has(bundleId)) {
    return appNameCache.get(bundleId) ?? undefined;
  }

  const query = `kMDItemCFBundleIdentifier == "${bundleId}"`;
  const result = spawnSync("mdfind", [query], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
  });

  if (result.status !== 0) {
    appNameCache.set(bundleId, null);
    return undefined;
  }

  const appPath = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.endsWith(".app"));

  if (!appPath) {
    appNameCache.set(bundleId, null);
    return undefined;
  }

  const appName = basename(appPath, ".app");
  appNameCache.set(bundleId, appName);
  return appName;
}

export function getBrowserName(bundleId: string): string {
  const installedName = resolveInstalledBrowserName(bundleId);
  if (installedName) {
    return installedName;
  }

  return BROWSER_NAME_BY_BUNDLE_ID[bundleId] ?? humanizeBundleId(bundleId);
}

export function getBrowserSubtitle(identifier: string): string {
  if (identifier === PROMPT_MARKER) {
    return "Show browser prompt";
  }

  if (identifier === DEFAULT_BROWSER_MARKER) {
    return "System default browser";
  }

  const parsed = parseBrowserIdentifier(identifier);
  return parsed.profile ? `Profile: ${parsed.profile}` : "No profile";
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

export function getSelectableBrowserIdentifiers(
  preferredBrowsers: string[],
  options?: {
    includePrompt?: boolean;
    includeSystemDefault?: boolean;
    promptFirst?: boolean;
    extraIdentifiers?: string[];
  },
): string[] {
  const includePrompt = options?.includePrompt ?? false;
  const includeSystemDefault = options?.includeSystemDefault ?? false;
  const promptFirst = options?.promptFirst ?? false;
  const extraIdentifiers = options?.extraIdentifiers ?? [];
  const orderedIdentifiers: string[] = [];

  function addIdentifier(identifier?: string) {
    if (!identifier || orderedIdentifiers.includes(identifier)) {
      return;
    }

    orderedIdentifiers.push(identifier);
  }

  if (promptFirst && includePrompt) {
    addIdentifier(PROMPT_MARKER);
  }

  preferredBrowsers.forEach((identifier) => addIdentifier(identifier));
  extraIdentifiers.forEach((identifier) => addIdentifier(identifier));

  if (!promptFirst && includePrompt) {
    addIdentifier(PROMPT_MARKER);
  }

  if (includeSystemDefault) {
    addIdentifier(DEFAULT_BROWSER_MARKER);
  }

  return orderedIdentifiers;
}
