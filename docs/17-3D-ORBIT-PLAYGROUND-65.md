# 17 · Component Animation Playground: 3D Orbit at 65%

> **Status:** implementation specification. The current repository has an inspector, schemas and motion references; the 3D Orbit playground, source-component renderer and MP4 export are **not yet implemented**.
> **Parent specification:** docs/16-COMPONENT-ANIMATION-PLAYGROUND.md (shared picker, editor, source adapters, security and QA).
> **Preset:** presets/orbit-3d-65.json.
> **Pilot:** private Brave-developments/fivem-resource-hub, consumed through an authorized local checkout.
> **Default output:** 1920×1080 at 30 FPS, 240 frames = **8 seconds**. 1080×1920 must capture its own layout and safe-area geometry.

## 1. Product goal and explicit meaning of “orbit”

Select an element already visible on the original website; keep its **existing React function, CSS, fonts, images, props and text**; lift an independently rendered copy out of the page; move it through an elliptical **3D-position orbit** around an editable focus point; softly turn the authentic front face toward camera as depth changes; return the element seamlessly into its exact original slot.

This is **not** a flat spin of an invented screenshot and **not** a 360° Y-rotation exposing a fabricated backside. The card completes a 360° *spatial path*, with mild front-facing yaw/pitch. Do not imply a back face exists if the original React UI has no real back face.

The preset is distinct from Fly Out & Return:
- Fly Out & Return: source → camera focus → hold → source, primarily translation/scale.
- 3D Orbit: source → orbital entry → **one closed 3D elliptical circuit with changing depth** → source.
- Both share the exact component source, scene layering, typed target ID, editor canvas, visual diff and render/export backend.

## 2. User experience and wireframe-level behaviour

### Connect and select

1. User selects **authorized source project** (local checkout path + SHA) and optionally local running website URL/route. Show source commit and renderability. Do not copy private source to public repository.
2. Site Explorer displays real browser output. Hover outlines actual DOM nodes. Inspect Mode intercepts clicks so the site does not navigate, download, react, buy or mutate a backend record.
3. Click a genuine card; resolve a unique stable selector + optional resource identifier + manifest component ID. Ambiguous matches require explicit choice. A runtime component source path is shown only after verification, not guessed from class names.
4. Target panel shows exact captured thumbnail/title/icons, DOMRect in CSS pixels, viewport/scroll/DPR, source SHA, resolved CSS/assets/providers, read-only props snapshot and child-selector readiness.
5. User selects **3D Orbit**, default **65% intensity**, sees its estimated safe radius and visual flags, presses Preview, scrubs frames or edits orbit geometry.

### Playground layout

- Top: project/website, source SHA, route, resolution, FPS, live/raster/recording status, font/asset parity badge, Save, Preview, Render.
- Left **Source Browser/Component Picker**: actual website, selectable card, DOM breadcrumb, component ID, verified import path and source snapshot.
- Centre **Remotion Canvas**: original plate + independent real component layer, orbit wire-path preview and focal point crosshair, optional projected bounds and safe-area guides. The path guide is editor-only, never baked into video.
- Right **Preset Inspector**: intensity 0–100, orbit radii x/y/z, perspective, camera focus, loop direction, number of revolutions (MVP fixed one), base zoom, face-camera yaw/pitch caps, background dim/blur, lighting/glow, start/return easing, clipping diagnostics. Lock 65% as initial value, not permanent user restriction.
- Bottom **Timeline**: page background, card layer, depth track, orbit path, glow/spotlight overlays, child effects and optional audio. Play, pause, scrub, ±1 / ±10 frames, jump to boundaries, current frame/timecode, keyframe markers, loop preview.
- Side by side **Compare**: source screenshot vs unanimated adapter frame vs output frame, plus diff overlay. Any visual fallback has a conspicuous badge and approval requirement.

### User controls

The editor makes change → validated props → same Remotion composition preview. Changing intensity, radius, focus or duration must not rewrite original component JSX. Undo/redo, save and re-open preserve the manifest, source SHA, renderability, selected target, effect and QA approvals. Disabled sliders disclose why e.g. “live child not addressable”.

## 3. Genuine React component reuse and isolation

Use docs/03-COMPONENT-ADAPTERS.md and examples/component-adapter.tsx. Locate the **real** resource card implementation in the source checkout, including inline JSX if that is how it is authored. Import the actual source implementation and its verified stylesheet/assets; do NOT write a fake ResourceCard component.

A VideoHost adapter may provide original router context, state providers, CSS variables, globals, fonts, trusted image files and **approved read-only snapshot data**. It may disable onClick mutation hooks, isolate network calls and freeze Date/random, but may not alter visual markup. A real title/button/icon can be animated individually only where it is mapped and proven.

**React runtime compatibility:** FiveM Hub is documented as React 18; FlashCut AI uses React 19 and Remotion 4.0.534. Keep a source-compatible, version-pinned render island in a separate local workspace/process if necessary. Never mix two React runtimes inside one React element tree. For preview→renderer synchronisation, use a validated, origin-checked bridge or the same supported composition bundle with identical props.

If direct import cannot render with pixel parity: label LIVE unavailable, explain missing dependencies and ask for explicit approval before using isolated raster original layers. Raster capture cannot make DOM children truly editable. Captured screen footage is only a separately labelled interaction fallback; **never** silently substitute it for original component reuse.

No actual downloads, checkout calls, Fire reaction increments, form submissions or external mutations occur during preview or render.

## 4. Correct background extraction, slot-preservation and geometry

Source screenshot at fixed route/state/viewport is the visual authority. Capture:
- reference.png: website with the selected component in its normal slot.
- background.png: same website/state while the selected DOM target has visibility:hidden, preserving its width/height and neighbouring grid flow. Restore any temporary state in finally.
- manifest JSON: measured CSS-px DOMRect, scroll offset, DPR, source SHA, screenshot/asset hashes, verified selector, runtime compatibility and source CSS.
- isolated original React component render with same props/data, verified by comparing against reference card region.

During source phase show reference.png; on frame **24**, switch to card-free background with a second instance of the **original React component** at identical coordinates/size (identity transform). Background and overlay cannot show duplicate cards. Use src/geometry.mjs fitRect() for fit-and-letterbox. For 9:16 use mobile source viewport or aspect-preserving camera; **never** distort the desktop site. Recompute geometry when viewport, scroll, breakpoint or data snapshot changes. Carry camera matrix in project state and apply precisely once; avoid DPR double-scaling.

At frame **215**, original overlay has exactly returned to identity; on frame **216**, show the page with its original card restored. Required continuity test: f23/f24, f59/f60, f179/f180, f215/f216. No hopping, ghosting, row reshuffling or invented UI during swaps.

## 5. Preset timing — exactly 240 frames at 30 FPS

All intervals below are [start, end), and Remotion frame numbers are zero-based.

| Phase | Frame interval | Inclusive examples | Action |
|---|---|---|---|
| Original UI | [0,15) | 0–14 | Unmodified original website |
| Highlight/anticipation | [15,24) | 15–23 | Source-anchored glow/pulse, no data change |
| Lift + enter orbit | [24,60) | 24–59 | At f24 identity at origin, ease toward orbit point θ=0; arrive at f59 |
| Orbit revolution | [60,180) | 60–179 | One 360° circuit with deterministic depth, front-facing yaw/pitch |
| Leave orbit + return | [180,216) | 180–215 | Exact continuous return to source rect by f215 |
| Restored original | [216,240) | 216–239 | Authentic website, overlay inactive |

Total length: 240 / 30 = **8.0 seconds**. Duration and FPS are user-editable later; frame contracts scale proportionately for other supported formats, with exact boundary tests updated. Frame **60 and frame 179 are the same spatial point** in the complete loop; frame 59 and frame 60 match; frame 179 and frame 180 match.

### 65%-intensity visual parameters

The table differentiates full-strength design maxima from effective 65%-strength *defaults*, before canvas safety clamps:

| Parameter | At 100% art-direction max | At 65% default | Notes |
|---|---|---|---|
| X orbit radius | 260 canvas px | **169 px** | Relative to adjustable focus |
| Y orbit radius | 92 canvas px | **59.8 px** | Vertical ellipse, not forced circular |
| Depth amplitude | 220 canvas px | **143 px** | Signed Z in CSS perspective |
| Base scale | 1.32 | **1.208** | Plus authentic perspective magnification |
| Pitch cap | ±9° | **±5.85°** | Low angle for text legibility |
| Yaw cap | ±18° | **±11.7°** | Never flip the card backward |
| Roll cap | ±2° | **±1.3°** | Decorative only |
| Background dim opacity | 0.50 | **0.325** | Background only, not detached card |
| Background blur | 8 px | **5.2 px** | Background only |
| Glow intensity | 1.0 | **0.65** | Independent effect layer |
| Perspective distance | 1200 canvas px | **1200 px** | Not intensity-scaled |
| Focus | (0.50W,0.46H) | Same | User can move focus |
| Spatial revolution | 360° | **360°** | Intensity affects size/depth, not orbit completion |
| Direction | Clockwise | Clockwise | User may reverse |

Interpretation: **65% intensity does not mean an incomplete 234° circle**. It means one complete revolution at **65% of orbit amplitudes, tilt, scale delta and VFX maxima**, preserving camera perspective. At intensity zero, the original component must remain stationary in its slot; no orbit, face tilt, zoom, glow, blur or dim. Timeline markers may remain but pose is identity. A positive intensity always uses one complete orbit unless user changes the revolutions setting in a later implementation.

To prevent clipping, fit the projected rotated card bounding box (including perspective) inside 86% canvas width and 80% height by reducing **effective orbit radius/scale/focus offset** and showing a visible clamp warning. No negative scale, singular transforms or automatic cropping of actual site content. Use element measured width/height and its projected rotated corners, not only card centre.

## 6. Canonical orbital mathematics / reference algorithm

Use canvas pixels, not DOM CSS pixels, *after* converting source rect using fitRect() or the explicit camera matrix. Define:
- Source rect S=(sx,sy,sw,sh) and source centre C=(sx+sw/2, sy+sh/2).
- Focus F=(0.5W,0.46H).
- Strength k=clamp(intensityPercent/100,0,1)=0.65.
- Rx=260k=169, Ry=92k=59.8, Rz=220k=143.
- P=1200 perspective px, baseScale=1+0.32k=1.208.
- Orbit start E=(Fx+Rx,Fy,0); θ=0 on orbit entry.
- Angular progress u=clamp((frame−60)/(179−60),0,1).
- Smooth angular time a(u)=0.5−0.5cos(πu), so θ=2πa(u). This has zero angular speed at endpoints, avoiding hard handoff at the entry/exit.
- Elliptical orbit centre B(θ)=(Fx+Rx cosθ,Fy+Ry sinθ,Rz sinθ).
- Yaw=18k sinθ; pitch=9k cosθ; roll=2k sinθ. Begin lift with pitch/yaw interpolation from identity to the θ=0 face pose, then reverse smoothly on return.
- A simple diagnostic projection factor is P/(P−z), with |z|<P; **do not apply it numerically if the CSS parent perspective already applies it**.

**One consistent transform convention is mandatory:** top-left component layer is anchored to S, transformOrigin centre, and composed CSS transforms move its centre to the desired world-space coordinates with transform translate3d(x−Cx, y−Cy, z) scale(baseScale) rotateX(pitch) rotateY(yaw) rotateZ(roll) under a perspective parent. Because CSS multiplication order and perspective origins affect final pixels, the renderer must test resulting browser bounding rects in a real Chromium render and adjust convention if required. Never substitute guessed fixed x/y offsets.

Exact phase pose function (reference, not runnable React implementation):

~~~ts
const k = clamp(intensityPercent / 100, 0, 1);
const entry = {x: focusX + 260*k, y: focusY, z: 0};
const source = {x: origin.x + origin.width/2, y: origin.y + origin.height/2, z: 0};

function poseAtFrame(frame) {
  if (k === 0 || frame < 24 || frame > 215) return identityAtSource;
  if (frame <= 59) {
    const t = smoothstep((frame-24)/(59-24)); // exact f24=0, f59=1
    return blendPose(identityAtSource, orbitPose(0, k), t);
  }
  if (frame <= 179) {
    const u = clamp((frame-60)/(179-60), 0, 1);
    const theta = 2*Math.PI*(0.5 - 0.5*Math.cos(Math.PI*u));
    return orbitPose(theta, k);
  }
  const t = smoothstep((frame-180)/(215-180)); // exact f180=0, f215=1
  return blendPose(orbitPose(2*Math.PI, k), identityAtSource, t);
}
~~~

This routine must use **exact** 0 and 2π endpoints to avoid sin/cos rounding artifacts at the f179→f180 handoff. Implement epsilon normalization of angles and clamp identity components to exact zero on f24/f215. Blend scale/tilt/position/depth; default interpolation is smoothstep but optional keyed easing can be introduced after the pilot. Read the source component's actual transform/transform-origin: wrap it in an outer motion layer, **do not overwrite inner source CSS transforms**.

The animation is frame-pure. Use Remotion useCurrentFrame()/useVideoConfig(), interpolate() and optionally spring() only when normalized to exact terminal states. No requestAnimationFrame, timers, unseeded random particle motion, CSS playback-time transitions or live API calls during the render. World-space X/Y/Z path is simulated via CSS 3D transforms on the original DOM plane; WebGL/Three.js is **not** required for MVP.

## 7. Foreground facing, lighting and true-source child effects

- Keep text upright and front-facing: yaw/pitch use small caps; set backfaceVisibility appropriately, but **do not create a reverse face UI**.
- Source screenshot/card region is exact at identity source phases. Perspective may naturally alter appearance *during* motion; this is an intended transform, not a markup change.
- Put shadow/glow on outer wrapper rather than changing the website component's CSS. Backdrop dimming affects only the card-free website plate.
- Optional anchored original children: thumbnail shallow 3D pop, Fire icon pulse, CTA outline, title micro-parallax. Every child is enabled only if its actual DOM node/source element can be addressed and pixels stay truthful.
- Fire pulse is visual-only; no counter increments or mutation. No fake product statistics, downloads or statuses. Keep dynamic data frozen at approved captured state.
- For a 3D orbit involving *multiple* cards in the future, use existing orbit-cards effect with separate source-verified target IDs. **MVP orbit-3d is exactly one selected genuine component**.

## 8. Typed storyboard and source integration

Retain the existing schemaVersion=1 storyboard and UI manifest. **Add a single enum value orbit-3d** to effects.name; do not repurpose orbit-cards, which already describes multiple cards. Do not remove or change existing extract-and-return entries. Existing saved projects must continue validating.

Persist an independent template in presets/orbit-3d-65.json with:
- targetId placeholder clearly named REPLACE_WITH_VERIFIED_MANIFEST_COMPONENT_ID, not treated as valid for production;
- method live, fps=30, width/height=1920×1080, shot duration 240 frames;
- effects orbit-3d, focus-glow, spotlight-dim; bounded offsets;
- explicit phase frames, perspective, safe area, orbit radii, face tilts, source-snapshot/QA warnings.

On target selection, copy the preset into project state and replace targetId only from a verified manifest ID; in runtime check selected source SHA, imported component path, props snapshot, asset hashes, geometric state and allowed effect. JSON Schema validation alone is insufficient; add effect-level semantic validation for phase frame boundaries, finite numbers, 0≤k≤100, |z|<P, safe target content and no reference to unsupported children. New experimental fields belong under effects[].params, which the current schema already permits.

Recommended future project state:
~~~ts
type OrbitProject = {
  schemaVersion: 1;
  sourceManifestRef: string;
  sourceCommit: string;
  targetId: string; // verified in current manifest
  presetId: "orbit-3d";
  intensityPercent: number; // 65 default, [0, 100]
  shot: {fps: number; durationFrames: number; output: {width: number; height: number}};
  selectedSnapshotHash: string;
  viewportCssPx: {width: number; height: number; dpr: number};
  orbitOverrides?: {focusX: number; focusY: number; radiusX?: number; radiusY?: number; depth?: number};
  qaApproval?: {reportPath: string; approvedAt: string};
};
~~~
Store it under ignored local out/ until an editor project-management format is implemented. No source app secrets or private source files may enter the public repo.

## 9. Remotion Player, frame control and renderer

Use the same **source-compatible Remotion composition and props** for live preview and final MP4 (isolated renderer if necessary):
- background source plate as first layer,
- original imported React component as independent absolute 3D layer,
- glow/dim/effect layers,
- optional verified child motion layers,
- no hidden second render of original card.

At frames 24–215 the card-free background is visible; outside that interval the normal source screenshot/site state is displayed.

Player API: play/pause, seek to integer frame, ±1/±10 step, jump to f23/f24/f59/f60/f179/f180/f215/f216, loop the orbit-only interval, read current FPS/duration, update inputProps from preset controls. Playback should be smooth but frame stepping and headless render output must be deterministic even if video preview drops frames. If the source render is in a separate React 18-compatible process/iframe, messages must validate origin, project ID, requested frame and preset data.

Use pinned compatible Remotion packages; the starter repo currently does **not** install Remotion. Do not assert the UI Player, renderer, video export or a cross-version React bridge exists yet. FlashCut AI is an optional **output-only** MP4 + metadata consumer until isolated renderer design is verified.

## 10. Visual fidelity tests and acceptance evidence

### Baseline and continuity

- Source screenshot and static unanimated Remotion layer must preserve the actual card image, text, fonts, icon glyphs, padding, shadow, radius and resource counts.
- Require proof that source slot layout is unchanged when hidden, plus no double-card screenshot.
- Compare f23/f24 (identity handoff), f59/f60 (orbit entry), f179/f180 (complete-loop exit), f215/f216 (identity restore), alongside f0/f120/f239.
- Geometry checks: origin centre within a suggested 1 output pixel at swap boundaries; use baseline-tuned image-diff thresholds instead of claiming platform-independent bit-identical antialiasing.
- At f60 and f179 path positions match exactly; at f120 depth changes; orbit centre is not static at 65%; near/far depth changes projected scale appropriately; at no frame do card corners cross safe output bounds.

### Test matrix

| Case | Expected |
|---|---|
| Selected source card exists once | Unique source ID/selector and positive geometry |
| Incorrect/ambiguous selector | Block rather than guessing |
| Genuine import absent / React runtime conflict | LIVE unavailable, error and labelled fallback |
| Missing fonts/image/real data | Visual parity FAIL or explicit review |
| Intensity 0 | Original card stationary, effects zero, identity at every frame |
| Intensity 65 | 169 / 59.8 / 143 orbit radii unless safety-capped; 360° complete loop |
| Intensity 100 | Full art-direction amplitudes only where projected bounds fit |
| Frame 24/215 | Exact source pose |
| Frame 59/60, 179/180 | No discontinuous position, angle, scale or z |
| Hidden source slot | No neighbour card reflow |
| Optional authentic child motion | Child data unchanged, network writes blocked |
| Vertical output | New mobile DOM measurement or aspect-safe website window |
| Render vs Player | Same frame positions, camera, props, images and diagnostics |
| Repeat render | Deterministic sampled-frame hashes under pinned render |
| Existing Fly Out & Return project | Continues to validate and behave unchanged |
| Third-party source without code | No promise of editable React source extraction |

### QA deliverables

Store locally, ignored by Git by default:
- project manifest, storyboard JSON and selected original source path+commit;
- reference.png, background.png, selected-card.png;
- f23, f24, f59, f60, f120, f179, f180, f215, f216, f239 PNGs and visual diff/contact sheet;
- export MP4 with verified resolution, duration, FPS and codec metadata (FFprobe/FFmpeg);
- comparison report including any canvas clamp and raster fallback approvals;
- test commands, real exits, absence of source database writes and source-code provenance.

No claims of end-to-end success until a **real FiveM Resource Hub** card is shown in the generated six- or eight-second MP4 and QA verifies source identity.

## 11. Proposed modules — add only as phases become buildable

~~~text
docs/17-3D-ORBIT-PLAYGROUND-65.md       # this spec
presets/orbit-3d-65.json                # schema-compatible template
specs/storyboard.schema.json            # add orbit-3d effect enum
apps/playground/src/...                 # existing planned picker/inspector/timeline
apps/renderer/src/effects/Orbit3D.tsx    # NEW source-card-only motion wrapper
src/orbit-motion.mjs                     # optional pure easing/path/pose math
tests/orbit-motion.test.mjs              # optional boundary & intensity tests
services/qa/...                          # visual parity comparison
~~~

Do not create a second competing playground or copy React source code into this repository. Add **a preset and effect module** to the shared editor outlined in docs/16. Source selection, adapters, previews and timeline controls must be reused from the Fly Out & Return infrastructure.

## 12. Security, reproducibility and rights

Keep the public engine repo free of private FiveM Hub/FlashCut source, credentials, user data or captured screenshots. Work in an authorized isolated local checkout; inspect package scripts before running an untrusted project. Network capture remains localhost-allowlisted during the pilot; restrict remote redirect/private IP access if broader URLs are supported later. Stable state snapshots, browser build, fonts and asset hashes prevent made-up content. Real Fire/download/cart/profile backend writes are blocked. Third-party assets require licence/reuse review before publishing video.

## 13. Implementation tickets and dependent gates

**Gate A — one real component imported:** pin FiveM commit, source-map actual card, load approved live data, record exact CSS assets, pass source-vs-adapter visual match. If this fails, do not fabricate a demo.

**Gate B — orbit path mathematics:** implement pure bounded poseAtFrame(), exact phase endpoints, 0/65/100 tests, projected safe bounds, continuous orbit point and no 180° flip. Test with synthetic rectangles for math only; not proof of website fidelity.

**Gate C — actual Remotion video:** integrate single original source card, background plate, identity swaps, 3D perspective and recorded screenshot/contact sheet. Export real 8s MP4 and verify sampled frames.

**Gate D — shared playground controls:** enable 3D Orbit preset picker, intensity slider, X/Y/Z radius controls, camera focus, frame scrub and undo. Reuse picker/saved projects from docs/16. Add status and clamp warnings.

**Gate E — reusable integrations:** test second React site, mobile fit, labelled raster fallback, stable export bundle and optional FlashCut MP4 import; regression test Fly Out & Return.

Agent is done only when the same actual source card can be selected, previewed at 65%, orbited in 3D, restored and exported without modifying website UI or triggering real site actions.

## 14. Agent handoff prompt

Implement docs/17-3D-ORBIT-PLAYGROUND-65.md in Brave-developments/ui-motion-engine as an **additive preset** to docs/16. First ensure a real source adapter and Playwright screenshot parity exist for a chosen FiveM resource card; do not invent source JSX or guess import paths. Use storyboard effect orbit-3d with intensity 65 and the 240-frame timeline. Prove 0/65/100 behaviour, loop closure, source identity, frame 23/24 and 215/216 swaps, no network writes and correct output metadata. Keep the private website and FlashCut sources out of the public engine repo. Commit only tested code and a QA comparison report. Clearly distinguish code implemented from specifications.

## 15. Official references (confirm APIs during implementation)

- Remotion fundamentals / frame model: https://www.remotion.dev/docs/the-fundamentals
- Remotion Player: https://www.remotion.dev/docs/player
- Remotion Player controls: https://www.remotion.dev/docs/player/player
- Remotion interpolate: https://www.remotion.dev/docs/interpolate
- Remotion version mismatch: https://www.remotion.dev/docs/version-mismatch
- Playwright element boxes: https://playwright.dev/docs/api/class-locator#locator-bounding-box
- Playwright screenshots and assertions: https://playwright.dev/docs/screenshots and https://playwright.dev/docs/test-snapshots

**Implementation status:** this specification and its template do not by themselves produce a working playground or a rendered video.
