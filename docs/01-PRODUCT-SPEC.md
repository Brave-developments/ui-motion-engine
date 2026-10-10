# 01 · Product requirements and definition of success

## Job to be done

A creator uploads or links a website project and asks: “Show this **exact** UI; lift a real resource card into 3D, animate its thumbnail and Fire button; put it back; then demo actual search.” The engine must inspect *real* content, suggest a shot plan, expose its renderability limits and produce an editable Remotion project and truthful promo video.

## Inputs

- **Primary:** user-authorized local React repo at a pinned Git commit, with optional running localhost URL and optional explicitly mapped API fixtures.
- **Secondary:** running website URL without source (browser capture mode only), or recorded footage from an existing project.
- Preferred shot format: 1080×1920 vertical / 1920×1080 landscape, fps 30 or 60, narration/audio optional.
- Optional storyboard natural language, selected targets from a click-to-select UI, screenshots or existing narration.

## Outputs

- Project manifest pinned to repo commit + route + asset hashes; source components and origin data never silently modified.
- Structured, reviewable storyboard with explicit per-shot method A/B/C.
- Remotion composition and previewable rendered frames; reproducible H.264/AAC (when audio exists) MP4.
- `qa/report.json`, source screenshots, thumbnails, warnings and export metadata.
- Optional independent MP4/PNG/still assets importable in FlashCut AI; integration is **not** required for v1.

## Required capabilities

1. Real UI reconstruction that passes screenshot comparison at same viewport, scroll position, data, fonts and DPR.
2. Element selection with reliable selector, component-source mapping and DOM geometry.
3. True extraction: separate moving instance (live component preferred), original slot visually vacated without layout reflow, exact start/end alignment.
4. Child-level effects for text/image/button only when child elements are individually addressable.
5. Deterministic timeline: smooth camera pan/scale, easing, tilt, shadow, blur, glows, pulses, particle overlays and return-to-grid.
6. Actual interactions via browser takes (search, typing, filter, scroll), not an AI hallucination.
7. Human-controlled choices of pacing, text, composition, final crop, data and replacement assets.
8. Clear warnings for fake-like reconstructions, incomplete fonts/assets, APIs inaccessible, and renderer incompatibility.
9. A visible visual-diff approval gate before any final render or publishing.

## Non-goals for MVP

- Convert any arbitrary deployed webpage into editable React source.
- Promise automatic extraction of dynamic components from arbitrary frameworks (Svelte, Angular, Canvas, WebGL, iframes).
- Fully automated editing without review, fully AI-generated UI, unlicensed content scraping or posting videos to social accounts.
- Replicate live backend effects by submitting writes or altering the source app.
- Merge FlashCut and site source into one React dependency tree before integration is proven.

## Mode rules

- **A:** true source reuse with component adapter and deterministic props/state. Preferred for cards and internal animations.
- **B:** actual DOM image layers, optionally alpha-isolated. Named as **raster layers** in editor, never as editable original React code.
- **C:** real browser recording for dynamic interactions, named as **footage**.
- An adapter failure may propose B or C, but **requires user-facing explanation and review**, not a stealth substitution.

## UX completion conditions

- User can identify where a component came from (path, hash, version, route) and see its confidence.
- For one chosen card, the first and last 10 frames match corresponding background position without ghost/double image or reflow.
- Effect can be edited (time, angle, depth, shadow, glow, return) without changing card contents.
- Recorded search uses actual website state and the video doesn't imply the underlying API succeeded unless it did.
