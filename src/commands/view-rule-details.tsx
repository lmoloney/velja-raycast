import { Action, ActionPanel, Icon, List, useNavigation } from "@raycast/api";
import { RuleDetailView } from "../components/rule-detail";
import { listRules } from "../lib/rules";

export default function Command() {
  const { push } = useNavigation();
  let rules: ReturnType<typeof listRules> = [];

  try {
    rules = listRules();
  } catch {
    rules = [];
  }

  return (
    <List searchBarPlaceholder="Select a rule to inspect...">
      {rules.map((rule) => (
        <List.Item
          key={rule.id}
          title={rule.title}
          subtitle={rule.browser}
          icon={Icon.TextDocument}
          actions={
            <ActionPanel>
              <Action title="Open Details" icon={Icon.Eye} onAction={() => push(<RuleDetailView rule={rule} />)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
