import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { BrowserIdentifier, VeljaConfig, VeljaRule, VeljaStatusSnapshot } from "./types";

const VELJA_APP_PATH = "/Applications/Velja.app";
const VELJA_BUNDLE_ID = "com.sindresorhus.Velja";
const PROMPT_MARKER = "com.sindresorhus.Velja.promptMarker";
const DEFAULT_BROWSER_MARKER = "com.sindresorhus.Velja.defaultBrowserMarker";

interface VeljaDefaultsPayload {
  defaultBrowser?: string;
  alternativeBrowser?: string;
  preferredBrowsers?: string[];
  rules?: string[];
}

export function isVeljaInstalled(): boolean {
  return existsSync(VELJA_APP_PATH);
}

export function isVeljaRunning(): boolean {
  const result = spawnSync("pgrep", ["-x", "Velja"], { encoding: "utf8" });
  return result.status === 0;
}

export function getVeljaVersion(): string | undefined {
  if (!isVeljaInstalled()) {
    return undefined;
  }

  try {
    return execSync(`defaults read "${VELJA_APP_PATH}/Contents/Info.plist" CFBundleShortVersionString`, {
      encoding: "utf8",
    }).trim();
  } catch {
    return undefined;
  }
}

export function parseBrowserIdentifier(identifier: string): BrowserIdentifier {
  const [bundleId, ...profileParts] = identifier.split("|");
  return {
    bundleId,
    profile: profileParts.length > 0 ? profileParts.join("|") : undefined,
  };
}

export function formatBrowserIdentifier(identifier?: string): string {
  if (!identifier) {
    return "Not configured";
  }

  if (identifier === PROMPT_MARKER) {
    return "Prompt";
  }

  if (identifier === DEFAULT_BROWSER_MARKER) {
    return "System Default Browser";
  }

  const parsed = parseBrowserIdentifier(identifier);
  return parsed.profile ? `${parsed.bundleId} (${parsed.profile})` : parsed.bundleId;
}

function readVeljaDefaultsPayload(): VeljaDefaultsPayload {
  const json = execSync(`defaults export ${VELJA_BUNDLE_ID} - | plutil -convert json -o - -`, {
    encoding: "utf8",
  });

  return JSON.parse(json) as VeljaDefaultsPayload;
}

function parseRules(rawRules: string[] | undefined): VeljaRule[] {
  if (!rawRules) {
    return [];
  }

  return rawRules.map((rule) => JSON.parse(rule) as VeljaRule);
}

export function readVeljaConfig(): VeljaConfig {
  const payload = readVeljaDefaultsPayload();

  return {
    defaultBrowser: payload.defaultBrowser,
    alternativeBrowser: payload.alternativeBrowser,
    preferredBrowsers: payload.preferredBrowsers ?? [],
    rules: parseRules(payload.rules),
  };
}

export function getVeljaStatusSnapshot(): VeljaStatusSnapshot {
  const installed = isVeljaInstalled();
  const running = isVeljaRunning();
  const version = getVeljaVersion();

  if (!installed) {
    return {
      installed: false,
      running: false,
      version,
    };
  }

  try {
    const config = readVeljaConfig();
    return {
      installed,
      running,
      version,
      config,
    };
  } catch (error) {
    return {
      installed,
      running,
      version,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
