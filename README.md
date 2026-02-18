# Velja Raycast Extension

A [Raycast](https://www.raycast.com/) extension for controlling [Velja](https://sindresorhus.com/velja) — the macOS browser router by Sindre Sorhus.

> Velja lets you open links in a specific browser or matching native app, easily switch between browsers, and create powerful rules for URL routing.

## Features

### Browser Management
- **List Browsers** — View all installed browsers and profiles detected by Velja
- **Get/Set Default Browser** — View or change the primary browser
- **Get/Set Alternative Browser** — View or change the alternative browser (triggered with Fn key)

### Rules Management
- **List Rules** — View all routing rules with their status
- **Toggle Rules** — Enable or disable rules
- **View Rule Details** — Inspect matchers, source apps, browser targets, and transform scripts
- **Create Rules** — Build new routing rules with URL matchers and source app filters
- **Delete Rules** — Remove rules you no longer need

### URL Actions
- **Open URL with Velja** — Open a URL respecting your Velja rules
- **Open URL in Browser** — Open a URL in a specific browser or profile
- **Remove Tracking Parameters** — Clean tracking parameters from URLs
- **Open URL from Clipboard** — Open the URL currently in your clipboard

## Prerequisites

- macOS 14+ (Sonoma or later)
- [Velja](https://sindresorhus.com/velja) installed and set as default browser
- [Raycast](https://www.raycast.com/) installed

## Development

```bash
# Clone the repo
git clone https://github.com/lmoloney/velja-raycast.git
cd velja-raycast

# Install dependencies
npm install

# Start development mode (hot-reload in Raycast)
npm run dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development setup and guidelines.

## Architecture

This extension uses a hybrid integration approach:
- **macOS Shortcuts** for Velja actions (get/set browsers, open URLs)
- **Plist read/write** for configuration and rule management

See [docs/architecture.md](docs/architecture.md) for detailed architecture decisions and [docs/velja-integration.md](docs/velja-integration.md) for Velja's integration surface.

## Project Status

This project is under active development. See the [GitHub Issues](https://github.com/lmoloney/velja-raycast/issues) for the current roadmap.

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | 🔜 | Project setup & core infrastructure |
| Phase 2 | 📋 | Browser management commands |
| Phase 3 | 📋 | Rules management |
| Phase 4 | 📋 | URL actions |
| Phase 5 | 📋 | Polish & advanced features |

## License

MIT
