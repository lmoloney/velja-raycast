# Copilot Instructions — Velja Raycast Extension

## Project Context

Raycast extension for controlling Velja.app (macOS browser router).
TypeScript + React. Hybrid integration: Shortcuts CLI + plist read/write.

## Code Style

- TypeScript strict mode
- Functional React components (Raycast convention)
- One Raycast command per file in `src/commands/`
- Shared utilities in `src/lib/`
- Use `@raycast/api` components: `List`, `Form`, `Detail`, `Action`, `ActionPanel`

## Velja-Specific Knowledge

- Rules stored as JSON strings in plist array at key `rules`
- Browser IDs: `com.bundle.id` or `com.bundle.id|Profile Name`
- Matcher kinds: `host` (exact), `hostSuffix` (ends-with), `urlPrefix` (starts-with)
- Special markers: `*.promptMarker` = show prompt, `*.defaultBrowserMarker` = system default
- Plist location: `~/Library/Preferences/com.sindresorhus.Velja.plist`
- AppIntents discovered: SetDefaultBrowser, GetDefaultBrowser, SetAlternativeBrowser, GetAlternativeBrowser, OpenBrowserProfile, OpenURLs, RemoveTrackingParameters

## When Making Changes

- Read `docs/architecture.md` for ADRs before making architectural decisions
- Read `docs/velja-integration.md` for Velja's data model and integration surface
- Always validate plist writes against the expected schema
- Use UUID v4 for new rule/matcher IDs
- After plist writes, consider cache flush needs
