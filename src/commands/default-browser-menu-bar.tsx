import { MenuBarExtra } from "@raycast/api";
import { useEffect, useState } from "react";
import { readVeljaConfig } from "../lib/velja";
import { getBrowserIcon, getBrowserTitle } from "../lib/browsers";

function getMenuBarTitle(identifier?: string): string {
  if (!identifier) {
    return "Velja";
  }

  const title = getBrowserTitle(identifier);
  if (title.length <= 20) {
    return title;
  }

  return `${title.slice(0, 17)}...`;
}

export default function Command() {
  const [defaultBrowser, setDefaultBrowser] = useState<string | undefined>(() => readVeljaConfig().defaultBrowser);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout | undefined;
    let retryCount = 0;

    const BASE_DELAY_MS = 5000;
    const MAX_DELAY_MS = 5 * 60 * 1000; // cap backoff at 5 minutes

    const scheduleNext = (delayMs: number) => {
      if (cancelled) {
        return;
      }

      timeoutId = setTimeout(() => {
        if (cancelled) {
          return;
        }

        try {
          const config = readVeljaConfig();
          setDefaultBrowser(config.defaultBrowser);

          // Reset backoff on success
          retryCount = 0;
          scheduleNext(BASE_DELAY_MS);
        } catch {
          setDefaultBrowser(undefined);

          // Exponential backoff on failure
          retryCount += 1;
          const backoffDelay = Math.min(BASE_DELAY_MS * 2 ** retryCount, MAX_DELAY_MS);
          scheduleNext(backoffDelay);
        }
      }, delayMs);
    };

    // Start polling with the base delay
    scheduleNext(BASE_DELAY_MS);

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const title = getMenuBarTitle(defaultBrowser);

  return (
    <MenuBarExtra icon={getBrowserIcon(defaultBrowser ?? "")} title={title}>
      <MenuBarExtra.Item title={`Default: ${getBrowserTitle(defaultBrowser ?? "")}`} />
      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="Refresh"
          onAction={() => {
            try {
              setDefaultBrowser(readVeljaConfig().defaultBrowser);
            } catch {
              setDefaultBrowser(undefined);
            }
          }}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
