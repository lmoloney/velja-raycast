import { Action, ActionPanel, Form, Toast, showToast } from "@raycast/api";
import { getBrowserTitle } from "../lib/browsers";
import { CreateRuleInput, createRule } from "../lib/rules";
import { VeljaMatcherKind } from "../lib/types";
import { readVeljaConfig } from "../lib/velja";

type FormValues = {
  title: string;
  browser: string;
  matcherKind: VeljaMatcherKind;
  matcherPattern: string;
  matcherFixture: string;
  sourceApps: string;
  forceNewWindow: boolean;
  openInBackground: boolean;
  onlyFromAirdrop: boolean;
  runAfterBuiltinRules: boolean;
  isTransformScriptEnabled: boolean;
  transformScript: string;
};

export default function Command() {
  const config = readVeljaConfig();
  const browserOptions = config.preferredBrowsers;

  if (browserOptions.length === 0) {
    return (
      <Form>
        <Form.Description text="No browsers found in Velja preferences. Configure browsers in Velja first." />
      </Form>
    );
  }

  async function handleSubmit(values: FormValues) {
    await showToast({ style: Toast.Style.Animated, title: "Creating rule..." });

    try {
      if (!values.title.trim()) {
        throw new Error("Rule title is required");
      }

      if (!values.browser) {
        throw new Error("Please select a browser");
      }

      const input: CreateRuleInput = {
        title: values.title,
        browser: values.browser,
        matcherKind: values.matcherKind,
        matcherPattern: values.matcherPattern,
        matcherFixture: values.matcherFixture,
        sourceApps: values.sourceApps
          .split(",")
          .map((sourceApp) => sourceApp.trim())
          .filter(Boolean),
        forceNewWindow: values.forceNewWindow,
        openInBackground: values.openInBackground,
        onlyFromAirdrop: values.onlyFromAirdrop,
        runAfterBuiltinRules: values.runAfterBuiltinRules,
        isTransformScriptEnabled: values.isTransformScriptEnabled,
        transformScript: values.transformScript,
      };

      const created = createRule(input);
      await showToast({ style: Toast.Style.Success, title: `Created "${created.title}"` });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could not create rule",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Rule" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Rule Title" placeholder="My Velja Rule" />
      <Form.Dropdown id="browser" title="Open In Browser" defaultValue={browserOptions[0]}>
        {browserOptions.map((identifier) => (
          <Form.Dropdown.Item key={identifier} value={identifier} title={getBrowserTitle(identifier)} />
        ))}
      </Form.Dropdown>

      <Form.Separator />
      <Form.Description text="Matcher (optional, leave pattern blank to create a source-app only rule)." />
      <Form.Dropdown id="matcherKind" title="Matcher Kind" defaultValue="hostSuffix">
        <Form.Dropdown.Item value="host" title="Host (exact)" />
        <Form.Dropdown.Item value="hostSuffix" title="Host Suffix (ends with)" />
        <Form.Dropdown.Item value="urlPrefix" title="URL Prefix (starts with)" />
      </Form.Dropdown>
      <Form.TextField id="matcherPattern" title="Matcher Pattern" placeholder="example.com" />
      <Form.TextField id="matcherFixture" title="Sample URL" placeholder="https://example.com/path" />

      <Form.Separator />
      <Form.TextField
        id="sourceApps"
        title="Source Apps (comma-separated bundle IDs)"
        placeholder="com.tinyspeck.slackmacgap, com.microsoft.VSCode"
      />
      <Form.Checkbox id="forceNewWindow" label="Force New Window" />
      <Form.Checkbox id="openInBackground" label="Open in Background" />
      <Form.Checkbox id="onlyFromAirdrop" label="Only from AirDrop" />
      <Form.Checkbox id="runAfterBuiltinRules" label="Run After Built-in Rules" />
      <Form.Checkbox id="isTransformScriptEnabled" label="Enable Transform Script" />
      <Form.TextArea id="transformScript" title="Transform Script" placeholder="$.url = new URL($.url.href);" />
    </Form>
  );
}
