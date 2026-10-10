# 10 · Development roadmap — gated work board

**Current status:** [x] architecture and agent contract, [x] JSON samples and inspection starter; everything below involving full component animation/video rendering remains [ ] to implement. Work is sequential; do not skip QA to ship an attractive-looking fake UI.

## Phase 0 — Inspect the real source and prove geometry

- [ ] Pin a specific FiveM Resource Hub SHA and snapshot its `apps/web` source, CSS/fonts/images and page route.
- [ ] Run repo in a safe local checkout with genuine/read-only approved data; capture desktop and mobile reference screenshots.
- [ ] Identify actual card component path (could be inline JSX), props, providers, CSS and original card text.
- [ ] Add explicit opt-in `data-motion-id` hook only if necessary via separate branch/PR; avoid breaking live UI.
- [ ] Generate UI manifest with selector, bbox, source link, child nodes and validated asset hashes.
- [ ] Pass inspector DOM geometry stability test, prove no missing fonts/images, record failure paths.

**Gate 0:** source card mapping and reference screenshot are real and reproducible.

## Phase 1 — One real resource card flies out and back (MOST IMPORTANT)

- [ ] Create a minimal Remotion composition in a separate workspace compatible with source React 18.
- [ ] Import *actual* resource-card implementation, CSS, font files and assets; use read-only snapshot props.
- [ ] Match source screenshot at exact viewport. Report any pixel-parity exceptions.
- [ ] Capture a background plate that leaves the original grid slot intact without showing the card.
- [ ] Calculate from/to positions using measured bbox, DPR and camera matrix; implement 3D tilt/zoom/glow.
- [ ] Independently animate an actual child (Fire visual) with **no real network mutation**.
- [ ] Implement perfect return and background swap; export tested 6-second sample MP4.
- [ ] If imported React component cannot render, prototype an explicitly labelled DOM-layer fallback; do not claim equivalence.

**Gate 1:** authentic card, correct fly-out and exact return, no visually invented UI or clipping. Store comparison evidence.

## Phase 2 — Reusable discovery and adapter SDK

- [ ] Source AST walker, CSS/import resolver, provider dependency detector, version conflict diagnostics.
- [ ] Stable DOM-to-component linking and editable selectors; browser picker overlay.
- [ ] User-reviewable adapter generator with golden screenshots and safe fixture injection.
- [ ] Tier B alpha-isolation pipeline with strict edge validation and child-layer limitations.
- [ ] Multisite test: one additional React/Vite site, plus a failure site with incompatible framework.

**Gate 2:** engine can import two distinct sites without AI recreating UI.

## Phase 3 — Cinematic shots and real website interactions

- [ ] Add camera moves, realistic shadows, depth, parallax, focus and particles.
- [ ] Implement real search/filter/scroll take via Playwright; reuse FlashCut recorder as a possible export adapter.
- [ ] Combine A/B/C scenes in one Remotion composition, align footage and overlays.
- [ ] Preserve actual logos/thumbnails, add optional creator-supplied caption/CTA layers.

**Gate 3:** complete 30s FiveM Hub promo; storyboard scene provenance visible.

## Phase 4 — Local editor and export

- [ ] Click-to-select targets, method badges, scene storyboard, preview and timeline.
- [ ] Per-effect keyframes and camera adjustments, project save/load/versioning.
- [ ] Render/export to MP4, QA report, reproducibility manifest, human approval gate.
- [ ] Crash recovery, job cancellation, bounds and error diagnostics.

**Gate 4:** non-developer can adjust shot without altering original site.

## Phase 5 — AI assistance (after reliable manual version)

- [ ] Structured director prompt with JSON schema validation and target-ID checking.
- [ ] Adapters suggestion agent that can choose effects but never synthesize site look.
- [ ] Screenshot/visual QA agent proposes fixes, requiring human review for visual data changes.
- [ ] Manual/AI mode parity and failure tests.

**Gate 5:** no untraceable site content in AI-proposed videos.

## Phase 6 — FlashCut AI integration

- [ ] Export project bundle or clip with provenance and audio/timeline metadata.
- [ ] Import into FlashCut AI as normal media first (no React/Remotion dependency collision).
- [ ] Optional durable editing bridge for clip/overlay references, with schema migration and rollback.
- [ ] Regression-test FlashCut existing newsroom/avatar/editor workflows.

**Gate 6:** FlashCut renders same result without breaking existing project saves/exports.

## Team/agent work allocation

One implementation agent owns the small vertical slice through Gate 1. One verification agent independently reviews source-versus-render screenshot parity. Only after Gate 1 should UI, AI and integrations be parallelized. Every PR must link a screenshot/reference, test commands and statement of unsupported features.
