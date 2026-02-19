import { Action, ActionPanel, Clipboard, Icon, List, Toast, showToast } from "@raycast/api";
import { getBrowserSubtitle, getBrowserTitle } from "../lib/browsers";
import { setAlternativeBrowserViaShortcut, setDefaultBrowserViaShortcut } from "../lib/shortcuts";
import { readVeljaConfig } from "../lib/velja";

function BrowserActions(props: { identifier: string }) {
  const { identifier } = props;

  async function handleSetDefault() {
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

  async function handleSetAlternative() {
    await showToast({ style: Toast.Style.Animated, title: "Updating alternative browser..." });

    try {
      setAlternativeBrowserViaShortcut(identifier);
      await showToast({ style: Toast.Style.Success, title: "Updated alternative browser" });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could not update alternative browser",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <ActionPanel>
      <Action title="Set as Default Browser" icon={Icon.CheckCircle} onAction={handleSetDefault} />
      <Action title="Set as Alternative Browser" icon={Icon.ArrowNe} onAction={handleSetAlternative} />
      <Action
        title="Copy Identifier"
        icon={Icon.Clipboard}
        onAction={async () => {
          await Clipboard.copy(identifier);
          await showToast({ style: Toast.Style.Success, title: "Copied browser identifier" });
        }}
      />
    </ActionPanel>
  );
}

export default function Command() {
  const config = readVeljaConfig();
  const defaultBrowser = config.defaultBrowser;
  const alternativeBrowser = config.alternativeBrowser;
  const browsers = [...config.preferredBrowsers];

  if (defaultBrowser && !browsers.includes(defaultBrowser)) {
    browsers.unshift(defaultBrowser);
  }

  if (alternativeBrowser && !browsers.includes(alternativeBrowser)) {
    browsers.unshift(alternativeBrowser);
  }

  return (
    <List searchBarPlaceholder="Search Velja browsers and profiles...">
      {browsers.map((identifier) => {
        const accessories: List.Item.Accessory[] = [];

        if (identifier === defaultBrowser) {
          accessories.push({ tag: "Default" });
        }

        if (identifier === alternativeBrowser) {
          accessories.push({ tag: "Alternative" });
        }

        return (
          <List.Item
            key={identifier}
            title={getBrowserTitle(identifier)}
            subtitle={getBrowserSubtitle(identifier)}
            accessories={accessories}
            icon={Icon.Globe}
            actions={<BrowserActions identifier={identifier} />}
          />
        );
      })}
    </List>
  );
}
