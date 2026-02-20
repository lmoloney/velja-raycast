import { strict as assert } from "node:assert";
import test from "node:test";
import { findRulesByDomainOrUrl } from "../src/lib/rule-matching";
import { VeljaMatcher, VeljaRule } from "../src/lib/types";

function makeRule(id: string, matcher: VeljaMatcher): VeljaRule {
  return {
    id,
    title: `Rule ${id}`,
    browser: "com.apple.Safari",
    isEnabled: true,
    matchers: [matcher],
    sourceApps: [],
    forceNewWindow: false,
    openInBackground: false,
    onlyFromAirdrop: false,
    runAfterBuiltinRules: false,
    isTransformScriptEnabled: false,
    transformScript: "",
  };
}

test("matches host rules only on exact hostname", () => {
  const rules = [
    makeRule("R1", {
      id: "M1",
      kind: "host",
      pattern: "medium.com",
      fixture: "https://medium.com",
    }),
  ];

  const exactMatches = findRulesByDomainOrUrl(rules, "medium.com");
  assert.equal(exactMatches.length, 1);
  assert.equal(exactMatches[0].matchedMatchers[0].kind, "host");

  const subdomainMatches = findRulesByDomainOrUrl(rules, "blog.medium.com");
  assert.equal(subdomainMatches.length, 0);
});

test("matches hostSuffix rules for base domain and subdomains", () => {
  const rules = [
    makeRule("R2", {
      id: "M2",
      kind: "hostSuffix",
      pattern: "medium.com",
      fixture: "https://blog.medium.com",
    }),
  ];

  const baseMatches = findRulesByDomainOrUrl(rules, "medium.com");
  const subdomainMatches = findRulesByDomainOrUrl(rules, "blog.medium.com");

  assert.equal(baseMatches.length, 1);
  assert.equal(subdomainMatches.length, 1);
  assert.equal(subdomainMatches[0].matchedMatchers[0].kind, "hostSuffix");
});

test("matches urlPrefix rules for full URL and normalized domain query", () => {
  const rules = [
    makeRule("R3", {
      id: "M3",
      kind: "urlPrefix",
      pattern: "https://medium.com/path",
      fixture: "https://medium.com/path/article",
    }),
  ];

  const urlMatches = findRulesByDomainOrUrl(rules, "https://medium.com/path/article");
  assert.equal(urlMatches.length, 1);
  assert.equal(urlMatches[0].matchedMatchers[0].kind, "urlPrefix");

  const nonMatchingDomain = findRulesByDomainOrUrl(rules, "medium.com");
  assert.equal(nonMatchingDomain.length, 0);
});

test("returns all potentially applicable matcher kinds for a domain", () => {
  const rules = [
    makeRule("R4", {
      id: "M4",
      kind: "host",
      pattern: "medium.com",
      fixture: "https://medium.com",
    }),
    makeRule("R5", {
      id: "M5",
      kind: "hostSuffix",
      pattern: "medium.com",
      fixture: "https://blog.medium.com",
    }),
    makeRule("R6", {
      id: "M6",
      kind: "urlPrefix",
      pattern: "https://medium.com/",
      fixture: "https://medium.com/article",
    }),
  ];

  const matches = findRulesByDomainOrUrl(rules, "medium.com");
  const matchKinds = matches.flatMap((match) => match.matchedMatchers.map((matcher) => matcher.kind)).sort();

  assert.deepEqual(matchKinds, ["host", "hostSuffix", "urlPrefix"]);
});

test("empty pattern never matches any query", () => {
  const rules = [
    makeRule("E1", { id: "ME1", kind: "host", pattern: "", fixture: "" }),
    makeRule("E2", { id: "ME2", kind: "hostSuffix", pattern: "", fixture: "" }),
    makeRule("E3", { id: "ME3", kind: "urlPrefix", pattern: "", fixture: "" }),
  ];

  assert.equal(findRulesByDomainOrUrl(rules, "medium.com").length, 0);
  assert.equal(findRulesByDomainOrUrl(rules, "https://medium.com/path").length, 0);
});

test("pattern with special characters (wildcard glob, underscore) never matches", () => {
  const rules = [
    makeRule("S1", { id: "MS1", kind: "host", pattern: "med*um.com", fixture: "" }),
    makeRule("S2", { id: "MS2", kind: "hostSuffix", pattern: "my_site.com", fixture: "" }),
  ];

  // Neither glob wildcards nor underscores are valid hostname characters, so these
  // rules should never produce a match regardless of the query.
  assert.equal(findRulesByDomainOrUrl(rules, "medium.com").length, 0);
  assert.equal(findRulesByDomainOrUrl(rules, "my_site.com").length, 0);
});

test("very long (but valid) domain names match correctly", () => {
  const longLabel = "a".repeat(63); // Max DNS label length
  const longDomain = `${longLabel}.example.com`;
  const rules = [
    makeRule("L1", { id: "ML1", kind: "host", pattern: longDomain, fixture: `https://${longDomain}` }),
    makeRule("L2", { id: "ML2", kind: "hostSuffix", pattern: "example.com", fixture: "https://example.com" }),
  ];

  const exactMatches = findRulesByDomainOrUrl(rules, longDomain);
  assert.equal(exactMatches.length, 2); // host + hostSuffix both fire

  const unrelatedMatches = findRulesByDomainOrUrl(rules, "other.example.com");
  assert.equal(unrelatedMatches.length, 1); // only hostSuffix fires
  assert.equal(unrelatedMatches[0].matchedMatchers[0].kind, "hostSuffix");
});

test("internationalized domain names (IDN) as full URLs are normalized to punycode", () => {
  // When supplied as a full URL the browser / URL API encodes the hostname to
  // punycode, so the query "https://bücher.example.com" resolves to the punycode
  // hostname and can match a rule whose pattern is the punycode equivalent.
  const punycodeDomain = "xn--bcher-kva.example.com"; // bücher.example.com in punycode
  const rules = [
    makeRule("I1", { id: "MI1", kind: "host", pattern: punycodeDomain, fixture: `https://${punycodeDomain}` }),
  ];

  const urlMatch = findRulesByDomainOrUrl(rules, `https://${punycodeDomain}`);
  assert.equal(urlMatch.length, 1);
  assert.equal(urlMatch[0].matchedMatchers[0].kind, "host");
});

test("raw non-ASCII hostname (IDN without scheme) is treated as invalid and never matches", () => {
  // A bare unicode hostname (no scheme) fails the ASCII-only hostname regex
  // (/^[a-zA-Z0-9.-]+$/) used internally by parseHost/parseHostPattern, so no
  // rules should fire — either for the query or for rules whose patterns also
  // contain non-ASCII characters (both are intentionally invalid here).
  const rules = [
    makeRule("I2", { id: "MI2", kind: "host", pattern: "bücher.example.com", fixture: "" }),
    makeRule("I3", { id: "MI3", kind: "hostSuffix", pattern: "bücher.example.com", fixture: "" }),
  ];

  assert.equal(findRulesByDomainOrUrl(rules, "bücher.example.com").length, 0);
});

test("domain with port as raw string is treated as invalid and never matches", () => {
  // "example.com:8080" is not a valid hostname (colon is illegal), so no rule fires.
  const rules = [
    makeRule("P1", { id: "MP1", kind: "host", pattern: "example.com", fixture: "https://example.com" }),
    makeRule("P2", { id: "MP2", kind: "hostSuffix", pattern: "example.com", fixture: "https://example.com" }),
  ];

  assert.equal(findRulesByDomainOrUrl(rules, "example.com:8080").length, 0);
});

test("domain with port embedded in a full URL matches the hostname without the port", () => {
  // The URL API strips the port from the hostname, so "https://example.com:8080"
  // correctly resolves to hostname "example.com" and fires matching rules.
  const rules = [
    makeRule("P3", { id: "MP3", kind: "host", pattern: "example.com", fixture: "https://example.com" }),
    makeRule("P4", {
      id: "MP4",
      kind: "urlPrefix",
      pattern: "https://example.com/",
      fixture: "https://example.com/",
    }),
  ];

  const matches = findRulesByDomainOrUrl(rules, "https://example.com:8080/path");
  const matchKinds = matches.flatMap((m) => m.matchedMatchers.map((mm) => mm.kind)).sort();
  assert.deepEqual(matchKinds, ["host", "urlPrefix"]);
});
