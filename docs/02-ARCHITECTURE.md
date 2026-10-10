# 02 · Architecture, data flow and coordinate system

## Modules (proposed)

```
apps/studio             # Vite/React editor, importer, selector, properties, timeline
services/inspector      # AST/code graph + local Playwright browser inspector
services/capture        # background plates, crop/layer isolation, browser takes
services/render         # Remotion bundler/renderer, pinned assets, render jobs
packages/contracts      # JSON Schema, TypeScript types and validation
packages/adapters       # repo-specific provider/state/CSS/asset bridges
packages/motion         # Extraction, transforms, effects, motion path templates
packages/qa             # screenshot diffs, metadata checks, frame assertions
```

Keep this repo independent. During Phase 1, implement a minimal Remotion proof-of-concept under `apps/studio` without building the entire server. Avoid prematurely adopting databases/queues; local JSON jobs on disk suffice until exports need concurrency.

## Canonical flow

1. `SourceIntake`: validate authorized path/repo commit or explicit localhost URL; never automatically open `.env` or credentials.
2. `Inventory`: read `package.json`, Vite aliases, tsconfig paths, React graph, components, imports, CSS, fonts, assets and router.
3. `Probe`: launch site under chosen test conditions, stabilize fonts/images, take screenshot, inspect candidate DOM IDs/bounds/selector state.
4. `Map`: map DOM target to source code where possible; pair selector with local `componentId`. Record missing providers/asset errors.
5. `Renderability`: isolated test render of an original component in Remotion environment; show parity report. If cannot render, evaluate B/C.
6. `Storyboard`: accept structured shots; AI may propose but validator has final say.
7. `Compile`: materialize only referenced assets, launch read-only adapter, load deterministic props, set composition size/framerate.
8. `Render/QA`: sample frames + boundary parity checks; report warnings; require review, then final MP4.

## Stable identifiers

Use `{repoCommit, route, cssSelector, nodeFingerprint, viewport, stateId}`. `nodeFingerprint` is a locally generated stable digest of normalized DOM attributes and available component metadata; **do not assume a CSS nth-child selector will survive content changes**. Prefer explicit `data-motion-id` where approved. Resolve duplicates visibly (include selection index or a verified data key).

## Coordinate spaces (essential to extraction)

- `DOMRect` from `getBoundingClientRect()`: viewport-relative CSS px.
- `pageX = rect.x + scrollX`, `pageY = rect.y + scrollY` if saving scroll-independent document coordinates.
- Video canvas at `W × H` pixels; browser capture viewport is `Vw × Vh` CSS px. In standard *fit-and-letterbox* mode, `s = min(W/Vw, H/Vh)`, `padX=(W - s*Vw)/2`, `padY=(H-s*Vh)/2`, `canvasRect={x:padX+s*rect.x,y:padY+s*rect.y,w:s*rect.width,h:s*rect.height}`.
- If browser screenshot uses `deviceScaleFactor != 1`, **normalize** it once. Don't accidentally apply DPR twice. Label all saved dimensions as CSS px or bitmap px.
- `object-fit: cover` / camera crop uses a *different transform* and must explicitly store camera matrix, focal point and clipping; never use fit formula for cover.
- Re-measure after viewport resize, font load, route transition, scroll, responsive breakpoint or data change. Geometry is a property of a **specific state and viewport**, not the component forever.

## Extraction layering and frame continuity

At extraction start, background layer shows original page; overlay renders real card at exactly its measured position. On the extraction frame, background image/state must omit the original card (e.g. visibility hidden, but preserve its layout). Overlay must match identical pixels. Overlap is allowed only when both are intentionally alpha-transitioned; avoid double card. On return, overlay matches measured final slot, then swap original back. For dynamic screens, a rendered background and card should share a fixed source state/snapshot.

## Job state and reproducibility

`created → inspecting → requires_review → compiling → preview_ready → rendering → verifying → ready` (or `failed`, `cancelled`). Store errors per target/shot and checkpoints for retries. Pin: source Git SHA, npm lockfile/dependency graph, exact render tool versions, viewport/DPR, motion preset params, input data, source assets + hashes, browser build, fps and locale/timezone. Disable `Date.now()`, random seeds, CSS keyframe timings and runtime network calls inside Remotion compositions.

## Interfaces

- UI manifest: [`../specs/ui-manifest.schema.json`](../specs/ui-manifest.schema.json).
- Storyboard: [`../specs/storyboard.schema.json`](../specs/storyboard.schema.json).
- Inspector POC: [`../scripts/inspect-dom.mjs`](../scripts/inspect-dom.mjs).
- Animation prototype: [`../examples/flying-card.tsx`](../examples/flying-card.tsx).

## Error classes

`SOURCE_UNREADABLE`, `UNTRUSTED_ORIGIN`, `RENDERER_INCOMPATIBLE`, `PROVIDER_MISSING`, `ASSET_MISSING`, `FONT_MISMATCH`, `SELECTOR_AMBIGUOUS`, `ELEMENT_OCCLUDED`, `PARITY_FAILED`, `CAPTURE_NONTRANSPARENT`, `STORYBOARD_INVALID`, `ENCODER_FAILED`. Errors must show source route/target and next manual action.
