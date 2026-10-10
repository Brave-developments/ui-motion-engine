# 16 · Component Animation Playground — implementation specification

**Status:** implementation specification, NOT an implemented feature.  
**Preset:** Fly Out & Return, intensity 100%.  
**Owner repository:** Brave-developments/ui-motion-engine.  
**Pilot source:** authorized local checkout of Brave-developments/fivem-resource-hub.  
**Default shot:** 1920 × 1080, 30 FPS, 180 frames (6 seconds). Also support 1080 × 1920 after new capture/measurement.

## 1. Objective and acceptance statement

Build an interactive local editor where a user opens an authorized React website, points at an **existing rendered component** (first: a FiveM Resource Hub resource card), and chooses Fly Out & Return. The selected **original UI**, not an AI approximation, separates visually from the page, flies toward the camera, rotates/glows, optionally animates authentic child targets, and returns to the exact source slot without reflow or double rendering. The result is scrubbable by frame in Remotion, editable without regenerating JSX, and exportable to MP4 with provenance and visual QA.

The signature workflow is:
**connect source → inspect actual running page → select real component → prove import/parity → adjust 100% preset → frame-accurate preview → approve QA → export**.

This extends existing docs/01–15, source manifest schema, storyboard schema, scripts/inspect-dom.mjs, src/geometry.mjs and examples/flying-card.tsx. It must not replace or fork the source site's card design or require changing FlashCut AI.

## 2. MVP boundaries

### Required

- Source picker: local authorized checkout path, pinned Git SHA, running localhost URL, page route, viewport and stable source state.
- Site viewer: authentic page screenshot/browser view with selectable visible DOM elements and unambiguous target inspection.
- Target panel: selected source path (when verified), DOM selector, rect, renderability tier, provider dependencies, child selectors and asset provenance.
- Source component adapter: original React component/JSX, CSS, fonts, images, SVGs, CSS variables and required providers, read-only fixture props, **no redesign**.
- Actual original card overlay with background slot vacated while preserving layout.
- Fly Out & Return preset with intensity 0–100; **100% values are specified in section 7**.
- Scrubbable Remotion Player; play/pause, previous/next frame, zoom/angle/focus/timing controls, before/after screenshot visual diff.
- Saved manifest + existing storyboard v1, preview frames, QA report, MP4; no production API writes.
- Clearly labelled fallback and fail-closed export on a live-component parity failure, unless explicitly reviewed.

### Excluded until after pilot

- Arbitrary React app conversion with no adapter, automatic Svelte/Angular/Canvas/WebGL source reconstruction.
- Fabricating source UI, fake resource records, fake click outcomes or fake engagement numbers.
- Cloud multi-user rendering, accounts/payments, real social publishing, complex AI editor, unapproved source-repo code changes.
- Combining a React 18 source tree inside FlashCut AI's React 19 runtime without an isolated compatibility strategy.

## 3. Exact interface specification

Desktop layout:
- **Top toolbar:** project name; source SHA; target route; viewport preset; current render tier (LIVE / RASTER / RECORDING / BLOCKED); last parity result; Save, Preview, Export.
- **Left panel — Site Explorer (25% typical):** source repository, route navigation, running-page preview or pinned screenshot, inspect cursor, DOM tree and candidate cards. Hover draws outlines; click selects an exact node. Esc toggles selection mode, not website interaction.
- **Centre — motion canvas (flexible):** 1920×1080 or 1080×1920 aspect-correct viewport with Remotion Player and overlays for source rect, output rect, focus point, collision/safe-area guides. Do not stretch site screenshots.
- **Right — Inspector (26% typical):** Source, Preset, Motion, Children, QA tabs. Show read-only original text/image preview and red flags. Controls for intensity, lift/hold/return frames, target centre, zoom, rotation, shadow, dim, optional child effects. Properties update Player inputProps, not source JSX.
- **Bottom — timeline (minimum 180 px):** website background track; independent live component track; optional target-child effects; spotlight/glow/VFX tracks; audio optional; playhead, frame numbers, start/extract/hold/return/restore markers.
- **Status drawer:** source parity contact sheet, missing CSS/font/image warnings, exact source file/commit, job logs and export path.

Keyboard: Space play/pause (unless input focused); Left/Right ±1 frame; Shift+Left/Right ±10 frames; Home/End first/last; Ctrl/Cmd+Z undo; Ctrl/Cmd+Shift+Z redo; Delete removes selected *animation layer* after confirmation, never source app UI.

At 100% intensity render label shows "100% — cinematic / safety constrained" when canvas fit reduces the target zoom. Never claim a physical 1.85× if effective scale was capped.

## 4. Component selection and identity

1. Open a clean Chromium context at an allowlisted localhost origin. The pilot may use the real source website only through an approved local checkout.
2. Fix capture viewport, DPR, locale, timezone, route, scroll, data snapshot; wait for required selector, fonts, image decode and multiple stable layout samples.
3. In Inspect Mode, intercept editor selection clicks in the viewer, not in the source page. Highlight candidate element and show true HTML attributes, text label, bounding box and computed paint context.
4. Resolve selected item using a stable data attribute (preferred), verified unique source identifier or selector + source-backed resource ID + DOM fingerprint. If more than one element matches, require a disambiguation action.
5. Save selected component ID from specs/ui-manifest.schema.json, not a CSS nth-child index alone. Attach source path only when AST/source-map evidence validates it.
6. Discover eligible **real child nodes** (thumbnail, title, button, fire icon); mark each independent-animation capability separately.
7. Re-measure if route, scroll, responsive breakpoint, data, fonts or viewport change. Invalidate cached measurements if source commit changes.

Selection must NOT trigger resource downloads, navigation, Fire reactions, checkout or database writes. Invalid selections: zero-size, occluded, offscreen, iframe without authorization, ambiguous selectors or unsupported render mode. Each displays a reason and recovery action.

## 5. Genuine source component reuse contract

Use the existing examples/component-adapter.tsx contract as a starting point, but validate it against the ACTUAL source file; do not invent "ResourceCard.tsx" or props.

The per-source plugin should provide:

~~~ts
type VideoComponentAdapter<P> = {
  sourceRepo: string;
  sourceCommit: string;
  sourceFile: string;                  // verified actual path
  componentId: string;                // manifest ID
  loadOriginalComponent: () => Promise<React.ComponentType<P>>;
  VideoHost: React.ComponentType<{children: React.ReactNode}>;
  buildPropsFromApprovedSnapshot: (data: Readonly<unknown>) => P;
  childSelectors: Record<string, string>;
  freezeState: (approvedSnapshot: unknown) => Promise<unknown>;
  assertNoWrites: (props: P) => void;
  reportAssetsAndDependencies: () => Promise<AdapterDiagnostics>;
};
~~~

This is an **interface proposal**, not a currently compiling API. The implementer must add types and code in the isolated source-specific worker.

The loaded component is the website's real implementation, including imported styling and artwork. A thin VideoHost may supply router/context, cached API snapshot, CSS variables and fonts. It may **not** recreate the original card's markup or replace a source component with a similar-looking design. Original source props/children must match measured screenshots. Source backend actions are mocked/disabled in the video host; clicking UI elements in preview cannot mutate production.

Inspect relevant local files including apps/web/package.json, TS/Vite path aliases, component exports, global stylesheet, CSS modules, icon imports, fonts, image URLs and context. Record source commit, resolved asset SHA, component source path and validation errors.

### React runtime strategy

FiveM Hub's verified package declarations are React 18.3.x; FlashCut AI's are React 19.2.x / Remotion 4.0.534. **Do not combine duplicate React runtimes in one component tree.**

Preferred: isolated source-compatible render workspace that bundles the original React component and matching React/ReactDOM, and an independently hosted local editor. Prove Remotion compatibility before adopting a specific toolchain/version. If the editor and renderer have incompatible React runtimes, render the source composition in a separate same-origin/allowlisted iframe or isolated process; use versioned validated messages such as LOAD_PROJECT, SET_FRAME, SET_PARAMS, READY, FRAME_RENDERED and ERROR. Validate origin and project ID. Frame seeking must be deterministic across boundaries. Ensure preview and headless export execute the **same composition** and props.

If direct source rendering fails, show LIVE unavailable; offer original DOM-layer capture with explicit RASTER limits. Ordinary screenshots have no guaranteed alpha transparency; transparent isolation requires actual proof. Browser recording is the final labelled fallback, not equivalent to editable React.

## 6. Website background + authentic extraction

Capture reference.png with card visible, and background.png for identical viewport/state with the target set to visibility:hidden (preserving layout). Restore source styling in finally. Never use display:none or remove the grid item. Capture DOMRect, transformed geometry, scroll, DPR and clipping/stacking context.

At extraction boundary:
- Original source card appears in the pre-extraction background.
- When the animated layer becomes active, render the **card-free background**, and place the original separately rendered card at *exactly the measured canvas rectangle*.
- Component layer starts with identity transform and identical pixel appearance. Any background dimming applies below the detached card.
- After return, remove component layer and restore the normal page image at the same position, with no frame pop.
- If a dynamic background prevents exact compositing, freeze the approved state or switch to a separately approved browser-shot method.

Use src/geometry.mjs fitRect() for viewport CSS-px to video-px under fit-and-letterbox. For cover/zoom compositions, implement and test a separate camera matrix and inverse selection transform; do not reuse fitRect for cover. Apply DPR exactly once. Store 2D target and parent transforms when supported; if non-invertible or severely clipped, block with a diagnostic.

## 7. Preset definition — Fly Out & Return @ 100%

Defaults: frame rate 30; shot frames 0–179 inclusive; 6.0 seconds. All ranges below use [start, end) notation:

| Phase | Frames | Behaviour |
| --- | --- | --- |
| Original site | [0, 10) | Stationary genuine website |
| Anticipation | [10, 15) | Fine highlight/outline anchored to card |
| Extraction switch | frame 15 | Swap to background without card + identity-transformed real card overlay |
| Lift | [15, 51) | From original centre to focus; scale/rotate/glow/shadow intensify |
| Hero hold | [51, 106) | Card floats in centre; optionally animate genuine child targets |
| Return | [106, 145) | Reverse to measured source rect; no bounce beyond slot |
| Restore | frame 145 | Swap overlay off, original site visible |
| End hold | [146, 180) | Genuine website, no extracted layer |

Full-strength parameters at a verified 1920×1080 canvas:

| Property | Target @100% | Constraint |
| --- | --- | --- |
| Scale | 1.85× | Cap by available safe canvas dimensions; never crop vital card content silently |
| Focus centre | (0.50 × width, 0.46 × height) | Editor-adjustable normalized values |
| RotateY | +16° | Perspective ~1200 output pixels; remain readable |
| RotateZ | −4° | Return to 0° at identity boundaries |
| Shadow | 70px blur, opacity 0.45 | Separate visual-only layer; no source CSS mutation |
| Outline/glow | 1.0 normalized | Overlay outside actual card box |
| Background dim | 0.68 opacity | Applied to background, not card |
| Background blur | 7px | Visual effect only during extraction |
| Lift frames | 36 | f15 identity → f51 peak |
| Hold frames | 55 | f51–f105 |
| Return frames | 39 | f106 peak → f145 identity |
| Child thumbnail | Optional pop up to 1.12× | Only if real child element is addressable |
| Fire icon | Optional 24-frame deterministic particle burst | Do not increment count or fire backend action |

Intensity percentage multiplies **all motion deltas and effects**, including translation, scale delta, rotation, shadow, glow, background dim and blur. At intensity 0, the component must remain in the original slot (no translation, rotation or zoom) and all VFX are disabled, even if timeline markers remain. Timing may remain unchanged across intensities. At 100%, use the numerical targets but honour fit/visibility/accessibility constraints.

**Important:** "100%" is an art-direction maximum, not permission to crop, distort, flicker aggressively or create fake content.

### Motion maths (implementable contract)

Let source rect already be mapped to canvas as origin = (x,y,w,h), centre C=(x+w/2,y+h/2); focus F=(0.5W,0.46H). Let p(t) be a bounded [0,1] trajectory with exact p(15)=0, p(51)=1, p(106)=1, p(145)=0. A frame can be calculated purely from frame and saved props:

~~~ts
const dx = focusX - (origin.x + origin.width / 2);
const dy = focusY - (origin.y + origin.height / 2);
const p = getBoundedLiftHoldReturnProgress(frame, phaseFrames); // exact endpoints
const strength = clamp(intensityPercent / 100, 0, 1);
const visualProgress = p * strength; // zero intensity = zero displacement
const effectivePeakScale = Math.max(0.25, Math.min(
  1.85,
  (canvasWidth * 0.86) / origin.width,
  (canvasHeight * 0.78) / origin.height
));
const scale = 1 + (effectivePeakScale - 1) * visualProgress;
const translateX = dx * visualProgress;
const translateY = dy * visualProgress;
const rotateY = 16 * visualProgress;
const rotateZ = -4 * visualProgress;
~~~

The example is normative for intent but not a complete transform implementation. Implement origin-centre translations and transform order consistently; test world-space geometry under 3D rotation and camera matrices. An alternative spring animation is permitted only if progress is clamped/normalized so frame 15 and frame 145 are **exact identity**, not asymptotic tails. Camera positioning must account for projected card width/height, not just raw scale, at peak tilt.

Keep deterministic changes inside useCurrentFrame(), interpolate()/spring() or pure helpers. Avoid timeouts, live requests, per-render Math.random(), unpinned animations and event-driven source mutations. A fixed deterministic random seed is allowed for particles.

### Child animation

Only show control toggles for children proven in the selected source component:
- Title: subtle independently scheduled movement using *the original rendered text node*, not copied fake text.
- Thumbnail: crop-preserving lift/parallax using actual image.
- Fire: pulse/particles anchored to actual icon coordinates; counter stays frozen.
- Button: outline/glow with pointer events disabled. Never trigger download/checkout.

If per-child layering cannot preserve fidelity, disable child control and show "whole-component only", rather than generating replacement markup.

## 8. Remotion frame control and preview

A dedicated source-compatible composition consumes:
- manifest source and selected component ID;
- pinned source snapshot and assets;
- viewport, output size, DPR, source rect;
- motion preset params, phase frames, optional child targets.

Render the website background, extracted original card, optional VFX and audio in distinct timeline layers. The Remotion Player provides live preview, seekTo(frame), play/pause and frame stepping via a ref. inputProps changes update the composition. Require the same props and composition entrypoint for both Player and server/headless render to prevent drift. If the Player lives in the separate runtime island, wrap Player commands as validated IPC messages.

Use @remotion/player for playback/scrubbing, Remotion Sequence/useCurrentFrame/useVideoConfig for frame time, @remotion/renderer or CLI for export and Playwright for source screenshots. Pin all Remotion packages to the **same exact tested version** in the renderer. Do not assume the starter repo already installs Remotion; its current package.json includes Playwright + Ajv only.

Player seeking must not issue repeated source browser clicks or writes. Screenshot comparisons must use the same clock/props, fonts ready, images decoded and known source data. Keep controls responsive at 100% intensity even if final render is expensive.

## 9. Data contract and persistence

**Reuse**, do not replace:
- specs/ui-manifest.schema.json (selected source component and actual bbox);
- specs/storyboard.schema.json (shot timeline, method live/raster/recording and effects);
- existing src/geometry.mjs functions.

Add a new editor project format only when an actual editor exists. Proposed minimal versioned shape: projectId, schemaVersion, sourceManifestPath/sourceHash, storyboardPath/storyboardHash, selectedTargetId, presetId, intensityPercent, timelineEdits, camera, approvedSnapshotHash, QA state, lastRender. Do not store credentials, cookie jars or source-specific secret data in that project file.

Use the checked-in template at presets/fly-out-return-100.json; it must validate against storyboard v1 but **cannot render until its placeholder target ID is replaced with a validated manifest ID**. The existing storyboard schema allows effect-specific params; implement separate typed runtime validation for phase sums, effect bounds, target child IDs, scale caps and target/render mode compatibility.

Undo/redo saves frame/timing/params/selection changes without mutating the source checkout. Autosave only editor project metadata and source-approved snapshots to ignored local output paths. Explicit QA approval is required after any source SHA, content, viewport or motion geometry change.

## 10. Folder and module integration

Preserve every existing file and starter CLI. Add code incrementally, without creating a large monorepo before the single real-card pilot works:

~~~text
apps/playground/                   # React editor UI and controls (new)
  src/components/SiteExplorer.tsx
  src/components/ComponentPicker.tsx
  src/components/MotionCanvas.tsx
  src/components/Inspector.tsx
  src/components/MotionTimeline.tsx
  src/components/VisualDiff.tsx
  src/state/playground-store.ts
apps/renderer/                     # isolated tested React/Remotion runtime (new)
  src/Composition.tsx
  src/SourceComponentHost.tsx
  src/BackgroundPlate.tsx
  src/effects/FlyOutReturn.tsx
  src/effects/ChildFX.tsx
services/source-inspector/         # extends scripts/inspect-dom.mjs
services/adapter-runner/           # source imports, provider/CSS/assets
services/qa/                       # source vs output frames, no-double-card tests
presets/fly-out-return-100.json    # declarative effect template
src/geometry.mjs                  # existing fit and focus math
examples/flying-card.tsx          # reference, not a replacement source card
specs/*.schema.json               # existing manifest/storyboard
out/                              # ignored screenshots, approved snapshots, videos
~~~

Implementation agent can consolidate adjacent modules while preserving boundaries. Avoid any need to duplicate the private website's code into this public engine repository. For initial pilot, source is a local checkout at pinned SHA and adapter may reside in an ignored local workspace. Commit source-agnostic adapter infrastructure, not source files or hidden screenshots.

### CLI targets after implementation

- npm run inspect -- --url http://127.0.0.1:5173 --out out/pilot (already provided, must continue working).
- npm run dev:playground (to be added).
- npm run studio (source-compatible Remotion Studio, to be added).
- npm run render:pilot (render verified MP4, to be added).
- npm run test:visual (full local source fixture test, to be added).
- npm test (must keep current Node unit tests + schema validation passing).

Do not document these proposed scripts as already runnable until implemented and tested.

## 11. Visual fidelity gate

Capture a normalized baseline of the original page at exactly the same state/viewport and compare with an unanimated composition frame *before* animation work. Require matching real text, asset URL/hash, image crop, type metrics, borders, radii, background and child layout. Use region-of-interest comparison for the card, whole-page diff, edge cases such as icon SVGs and a human-review overlay.

Test exact boundary frames 14/15 and 144/145; first/last 10 frames must have no double image or blank card. At frame 15 the detached overlay equals the source card at identity; at frame 145 card is restored in its exact position and layout. Test stable siblings/slot; use a 1-video-pixel geometric position tolerance as a suggested pilot threshold, and establish separate baseline-tuned pixel-diff thresholds instead of pretending antialiasing can always match bit-for-bit.

Mandatory visual report:
- reference.png, overlay-at-origin.png, f14.png, f15.png, f51.png, f105.png, f144.png, f145.png, last.png;
- pixel-diff.png/contact-sheet.png, source vs render CSS box/error metrics;
- provenance of source component, commit, CSS/assets and approved snapshot;
- mismatch warnings with PASS / NEEDS_REVIEW / FAIL per shot.

Automate as much as feasible with Playwright screenshots, frame stepping and an image-diff library. Render the final MP4 and inspect actual codec, dimensions, duration, fps and several decoded frames with FFprobe/FFmpeg. Do not claim success from synthetic fixtures alone.

## 12. Test matrix

| Test | Required outcome |
| --- | --- |
| Unique selectable resource card | Correct source + selector + bbox + component ID |
| Duplicate selectors | Mark ambiguous; never silently select first |
| React import + providers + CSS | Visually matches original; no duplicate React hook failure |
| Missing font/image | Visible diagnostic; block parity approval |
| 0% intensity | No move and no VFX; no fabricated interactions |
| 100% intensity | Full preset values except explicit safe canvas caps |
| f14 → f15 | One authentic card visible, zero ghosting/reflow |
| f51 and f105 | Hold at requested focus and peak intensity |
| f144 → f145 | Identical source slot and no pop |
| Child Fire pulse | Icon animates, count and DB unchanged |
| Narrow/mobile viewport | New measured bounds and safe crop; no reuse of desktop rect |
| Unauthorized/untrusted origin | Reject; no cookies/secrets carried |
| Missing direct import | Explicitly fail LIVE and offer labelled RASTER/RECORDING |
| Parameter changes | Player and final export match at sampled frames |
| Re-render same inputs | Same deterministic frame hashes under pinned render context |
| Existing tests / schemas | No regression in original npm test, inspect or validate |

## 13. Security and rights

The engine repository is currently public; private source checkout files, screenshots containing private data, fixture records and proprietary source bundles MUST stay ignored. Do not vendor FiveM Resource Hub or FlashCut AI code. Isolate untrusted source execution; dependency installs/scripts require approved sandbox policies. Limit browser navigation to explicitly authorized local origins. No hidden auth session copying, provider credentials or live API mutations. Use read-only approved data; mark asset licences/permissions and publication approval. Export must be opt-in and respect user-supplied media rights.

## 14. Delivery phases and PR gates

**P0 — Repo inspection + baseline.** Find the REAL card source, pin SHA, run genuine site with approved data, make DOM/asset inventory and screenshot. Deliver actual source path and baseline. Block P1 if there is no real card.

**P1 — One real-card composition.** Add isolated compatible renderer, source adapter and CSS/providing context. Render source card unchanged in static MP4 frame. Deliver parity proof. **This is the highest-risk task.**

**P2 — Fly-Out-Return engine.** Add split background, source overlay, measured bbox, frame-pure 100% preset, exact origin/return swaps and optional true child FX. Export a playable six-second MP4; prove f14/f15/f144/f145 continuity.

**P3 — Playground editor.** Source picker, target selection, inspector, 100% intensity preset slider, preview/scrub, timeline, save/undo and QA contact sheet. Users can change zoom/timing without editing JSX.

**P4 — Robustness and reuse.** Mobile framing, second independent React source, RASTER limitation warnings, interrupted render recovery, snapshot locking, deterministic tests, optional FlashCut handoff.

**P5 — Later agent assistance.** AI can select targets/effects and output validated existing storyboard JSON, **never** invent UI. No AI dependency for first functional playground.

Every PR: exact source paths/SHAs, original vs frame comparison, commands and real exit statuses, limitations, rendered proof artifact, unchanged source-site repository and safety/rights statement.

## 15. Definition of done

All of these must be true:
1. Developer can open local playground and choose a genuine FiveM Hub card using a stable selector.
2. The rendered card is a reuse of actual website React implementation with verified source file and pinned data/assets.
3. Video at 100% intensity visibly flies out, floats/glows, optionally pulses a real Fire child and returns; source layout does not shift.
4. Scrubbing frame 14/15/51/105/144/145 produces coherent snapshots matching the approved source.
5. Remotion Player and MP4 agree on geometry/appearance, with no fabricated source UI or backend writes.
6. Visual QA passes (or exceptions are explicitly reviewed) and MP4 technical inspection passes.
7. Existing npm test, validator and inspector continue working; repository contains no private source copy or secrets.
8. Deliver final editable project file, output MP4 and source/provenance/QA evidence.

## 16. Official API documentation checked for implementation

- Remotion Player, seekable editor: https://www.remotion.dev/docs/player
- Remotion Player API: https://www.remotion.dev/docs/player/player
- Remotion frame interpolation: https://www.remotion.dev/docs/interpolate
- Remotion springs: https://www.remotion.dev/docs/spring
- Remotion assets and styling: https://www.remotion.dev/docs/assets
- Remotion version alignment: https://www.remotion.dev/docs/version-mismatch
- Playwright locator screenshots: https://playwright.dev/docs/api/class-locator#locator-screenshot
- Playwright screenshot assertions: https://playwright.dev/docs/test-snapshots

This specification defines an implementation target. It does NOT state that the playground UI, direct source renderer or production-quality card extraction is currently implemented.
