import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { VeljaMatcher, VeljaMatcherKind, VeljaRule } from "./types";
import { VELJA_BUNDLE_ID, readVeljaConfig } from "./velja";

export interface CreateRuleInput {
  title: string;
  browser: string;
  matcherKind: VeljaMatcherKind;
  matcherPattern: string;
  matcherFixture: string;
  sourceApps: string[];
  forceNewWindow: boolean;
  openInBackground: boolean;
  onlyFromAirdrop: boolean;
  runAfterBuiltinRules: boolean;
  isTransformScriptEnabled: boolean;
  transformScript: string;
}

function toVeljaUuid(): string {
  return randomUUID().toUpperCase();
}

function writeRules(rules: VeljaRule[]): void {
  const serializedRules = rules.map((rule) => JSON.stringify(rule));
  const args = ["write", VELJA_BUNDLE_ID, "rules", "-array", ...serializedRules];

  const result = spawnSync("defaults", args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
  });

  if (result.status !== 0) {
    const error = result.stderr.trim() || "Failed to write Velja rules";
    throw new Error(error);
  }
}

export function listRules(): VeljaRule[] {
  return readVeljaConfig().rules;
}

export function toggleRule(ruleId: string): VeljaRule {
  const rules = listRules();
  const index = rules.findIndex((rule) => rule.id === ruleId);

  if (index < 0) {
    throw new Error("Rule not found");
  }

  const updatedRule = {
    ...rules[index],
    isEnabled: !rules[index].isEnabled,
  };

  const updatedRules = [...rules];
  updatedRules[index] = updatedRule;
  writeRules(updatedRules);
  return updatedRule;
}

export function deleteRule(ruleId: string): void {
  const rules = listRules();
  const updatedRules = rules.filter((rule) => rule.id !== ruleId);

  if (updatedRules.length === rules.length) {
    throw new Error("Rule not found");
  }

  writeRules(updatedRules);
}

function buildMatcher(input: CreateRuleInput): VeljaMatcher[] {
  if (!input.matcherPattern.trim()) {
    return [];
  }

  return [
    {
      id: toVeljaUuid(),
      kind: input.matcherKind,
      pattern: input.matcherPattern.trim(),
      fixture: input.matcherFixture.trim(),
    },
  ];
}

export function createRule(input: CreateRuleInput): VeljaRule {
  const newRule: VeljaRule = {
    id: toVeljaUuid(),
    title: input.title.trim(),
    browser: input.browser,
    isEnabled: true,
    matchers: buildMatcher(input),
    sourceApps: input.sourceApps,
    forceNewWindow: input.forceNewWindow,
    openInBackground: input.openInBackground,
    onlyFromAirdrop: input.onlyFromAirdrop,
    runAfterBuiltinRules: input.runAfterBuiltinRules,
    isTransformScriptEnabled: input.isTransformScriptEnabled,
    transformScript: input.transformScript,
  };

  const rules = listRules();
  writeRules([...rules, newRule]);
  return newRule;
}
