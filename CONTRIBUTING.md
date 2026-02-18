# Contributing to Velja Raycast Extension

## Prerequisites

- macOS 14+ (Sonoma or later)
- [Raycast](https://www.raycast.com/) installed
- [Velja](https://sindresorhus.com/velja) installed and set as default browser
- Node.js 22.14+
- npm 7+

## Getting Started

```bash
# Clone the repo
git clone https://github.com/lmoloney/velja-raycast.git
cd velja-raycast

# Install dependencies
npm install

# Start development mode
npm run dev
```

Development mode provides hot-reloading in Raycast. Open Raycast and your extension commands will appear.

## Project Structure

```
src/
  commands/           # Raycast commands (one file per command)
  lib/                # Shared utilities
    velja.ts          # Velja detection, plist reading
    shortcuts.ts      # macOS Shortcuts CLI wrapper
    rules.ts          # Rule CRUD operations on plist
    types.ts          # TypeScript interfaces
    browsers.ts       # Browser name/icon helpers
docs/
  architecture.md     # Architecture Decision Records
  velja-integration.md # Velja integration research
```

## How It Works

This extension uses two integration methods with Velja:

### 1. macOS Shortcuts (for actions)
Velja exposes AppIntents that can be invoked via macOS Shortcuts. We use the `shortcuts` CLI tool to run pre-created Shortcuts that wrap Velja's actions (e.g., Set Default Browser, Open URL).

### 2. Plist Read/Write (for configuration)
Velja stores its configuration in `~/Library/Preferences/com.sindresorhus.Velja.plist`. We read this for displaying current config and rules, and write to it for rule management (since there are no Shortcuts actions for rules).

## Development Guidelines

1. **One command per file** in `src/commands/`
2. **Share code** via `src/lib/` utilities
3. **TypeScript strict mode** — no `any` types
4. **Follow Raycast conventions** — use `@raycast/api` components
5. **Test with real Velja** — the extension requires a running Velja installation

## Useful Commands

```bash
npm run dev          # Start dev mode with hot-reload
npm run build        # Production build
npm run lint         # ESLint
npm run fix-lint     # Auto-fix lint issues
```

## Debugging

- Raycast shows error overlays for runtime errors
- Use `console.log()` — output appears in Raycast's developer console
- For plist debugging: `defaults read com.sindresorhus.Velja`
- For Shortcuts debugging: `shortcuts list | grep -i velja`

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes with clear, focused commits
3. Ensure `npm run lint` and `npm run build` pass
4. Open a PR with a description of what changed and why
