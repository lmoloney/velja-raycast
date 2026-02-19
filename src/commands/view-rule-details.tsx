import { Action, ActionPanel, Icon, List, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { RuleBrowserPicker } from "../components/rule-browser-picker";
import { RuleDetailView } from "../components/rule-detail";
import { getBrowserTitle } from "../lib/browsers";
import { listRules } from "../lib/rules";

export default function Command() {
  const { push } = useNavigation();
  const [rules, setRules] = useState<ReturnType<typeof listRules>>([]);

  useEffect(() => {
    try {
      setRules(listRules());
    } catch {
      setRules([]);
    }
  }, []);

  return (
    <List searchBarPlaceholder="Select a rule to inspect...">
      {rules.map((rule) => (
        <List.Item
          key={rule.id}
          title={rule.title}
          subtitle={getBrowserTitle(rule.browser)}
          icon={Icon.TextDocument}
          actions={
            <ActionPanel>
              <Action.Push
                title="Remap Target Browser"
                icon={Icon.Pencil}
                target={
                  <RuleBrowserPicker
                    rule={rule}
                    onUpdated={(updatedRule) =>
                      setRules((existing) => existing.map((item) => (item.id === updatedRule.id ? updatedRule : item)))
                    }
                  />
                }
              />
              <Action title="Open Details" icon={Icon.Eye} onAction={() => push(<RuleDetailView rule={rule} />)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
