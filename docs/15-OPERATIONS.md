# 15 · Setup, inspection and runbook

## Prerequisites

Node 22.12+; npm; `playwright` Chromium installed; access to an explicitly authorized local web application. The starter scripts do not require API keys. `npm install` in this starter installs only Ajv + Playwright (and their transitive packages).

## Quick start

```bash
npm install
npx playwright install chromium
npm test
npm run inspect -- --url http://127.0.0.1:5173 --out out/site
```

Default captures candidates for `[data-motion-id]`, `article`, buttons, `a`, inputs, and several common card/item class-name variants. Provide a targeted `--selector` after inspecting your actual DOM. A supplied selector matching multiple nodes is explicitly reported; it won't arbitrarily choose one card as verified target.

Use `--width 1440 --height 900 --dpr 1 --selector '...'` for repeatable capture. The script permits only loopback HTTP(S), uses a fresh, cookie-free Playwright context and does not execute user-supplied script strings. Captured screenshots/DOM metadata are in ignored `out/`.

## Outputs

`out/site/reference.png`: actual viewport screenshot. `out/site/inspect.json`: input URL, viewport, page title, inspected elements, bounds, selector match counts and diagnostics. `out/site/target.png`: raw crop when a unique visible target was found. Crop has *no guarantee of transparency*. This is a first auditing tool only.

## Local source-specific run

The real FiveM Hub may depend on API/Postgres. Follow its *own README* to run it with genuine data and allowed credentials — never copy them into this repo. Start web at localhost:5173 in the source checkout, then run inspector from this engine checkout.

## Troubleshooting

- **Browser binary missing:** `npx playwright install chromium`.
- **Connection refused:** website is not started or uses a different port. Do not use a live production URL for the local-only inspector.
- **Target not found:** open `reference.png` and `inspect.json`; locate correct selector and ensure route/API loaded. No fabricated elements.
- **Multiple matches:** choose a unique data key or an explicitly approved selector (do not guess first element).
- **Font/image mismatch:** await font/images, cache authorized assets, use matching viewport/DPR; visual parity gate must block.
- **Frame doesn't match card slot:** check DPR, scroll offset, CSS transforms, crop mode and pixel-coordinate conversion.
- **React hook errors:** duplicate React or missing providers; fix render adapter or downgrade to visibly labelled fallback.
- **Raster edge rectangle:** crop isn't transparent; don't claim extracted layer, render actual source component or build isolated alpha renderer.

## Publishing/deployment

Not yet a deployed service. No CI render job is included that would run arbitrary imported code. Gate any future remote capture/execution service behind origin safeguards, sandboxing, quotas and review. Output paths are ignored and should not accidentally enter Git commits.
