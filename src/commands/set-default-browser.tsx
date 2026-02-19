import { Action, ActionPanel, Icon, List, Toast, showToast } from "@raycast/api";
import { getBrowserSubtitle, getBrowserTitle, getSelectableBrowserIdentifiers } from "../lib/browsers";
import { setDefaultBrowserViaShortcut } from "../lib/shortcuts";
import { readVeljaConfig } from "../lib/velja";

export default function Command() {
  const config = readVeljaConfig();
  const browserIdentifiers = getSelectableBrowserIdentifiers(config.preferredBrowsers, {
    includeSpecialOptions: true,
    extraIdentifiers: config.defaultBrowser ? [config.defaultBrowser] : [],
  });

  async function handleSetDefault(identifier: string) {
    await showToast({ style: Toast.Style.Animated, title: "Updating default browser..." });

    try {
      setDefaultBrowserViaShortcut(identifier);
      await showToast({ style: Toast.Style.Success, title: "Updated default browser" });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could not update default browser",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <List searchBarPlaceholder="Select Velja default browser...">
      {browserIdentifiers.map((identifier) => (
        <List.Item
          key={identifier}
          title={getBrowserTitle(identifier)}
          subtitle={getBrowserSubtitle(identifier)}
          icon={Icon.Globe}
          accessories={identifier === config.defaultBrowser ? [{ tag: "Current" }] : []}
          actions={
            <ActionPanel>
              <Action
                title="Set as Default Browser"
                icon={Icon.CheckCircle}
                onAction={() => handleSetDefault(identifier)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
