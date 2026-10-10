# 12 · FlashCut AI integration — preserve existing editor

## Verified existing app

The private `Brave-developments/flashcut-ai` project already contains a local Vite dashboard, Remotion preview/render, declarative Playwright Chromium product-demo recorder (WebM), media import, independently timed overlays, captions, narration and H.264 output. It currently uses React `^19.2.0` and Remotion `4.0.534`. Its [`docs/PRODUCTION.md`](https://github.com/Brave-developments/flashcut-ai/blob/main/docs/PRODUCTION.md) describes demo recording and the media/timeline contract. This new project should **reuse** these existing capabilities rather than copy or replace the FlashCut UI.

## Stage 1: asset/clip handoff (safe)

`ui-motion-engine` exports:

```
export/<project-id>/
  video.mp4                 # final promo or individual shot
  alpha-card.mov/webm       # optional transparent overlay, if encoder/alpha works
  poster.png                # preview
  storyboard.json           # timestamped shots, original source info
  manifest.json             # commit, route, geometry, assets
  report.json               # QA + rights warnings
```

Import MP4 and poster through FlashCut's existing normal media flow. The existing editor can trim/reorder/add captions, narration or HeyGen avatar footage. This stage avoids blending React 18 website components into React 19 FlashCut runtime.

## Stage 2: reusable clip metadata

Map motion scene start/end to FlashCut's existing project overlay tracks. Keep explicit media source, rights, transparent/opaque status and optional subtitles. `project.version` migrations must be backward-compatible; FlashCut's current version 1 project format must remain usable.

## Stage 3: deeper live editing (optional)

Only if needed after first successful videos: offer a local sidecar service for rendering changes when an editing property changes. Communicate via validated JSON/IPC. Keep dependency trees separate and render locally. Avoid copy-pasting FlashCut recorder or replacing its engine; expose a bridge to `POST`/file workflows after reviewing actual APIs and tests.

## Regression tests

Existing FlashCut workflows — HeyGen import, source evidence, browser takes, subtitles, media library, audio and existing project export — must keep working. A new motion clip cannot overwrite independent avatar/subtitle tracks. Browser recorder permission/SSRF controls continue to apply; any local development origin exception must be user-approved.
