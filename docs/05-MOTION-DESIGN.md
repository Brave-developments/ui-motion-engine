# 05 · Motion grammar and visual effects

## First required effect: `extract-and-return`

Stages in a 6-second 30-fps card shot (180 frames) are *configurable*, not hard-coded:

- f0–14: source frame still, hover hint and bright fine outline around original element.
- f15: start extracted layer at **same x,y,w,h**, visually remove original underlying card while preserving grid hole.
- f15–48: translate toward camera focus while scale moves from 1.0 to 1.6; rotateY up to 12°, rotateZ ~-3°, shadow deepens; ease smoothly with Remotion `spring`/`interpolate`.
- f49–103: 3D card holds; original thumbnail, label and CTA can animate independently **only if direct React render or correctly isolated child layers**; Fire effect is a VFX overlay, **no backend write**.
- f104–144: reverse spring and translate/rotate back to precisely measured `(x,y)` and `scale=1`.
- f145: restore original card, remove overlay, avoid any discontinuity.
- f146–180: continue website scene/camera to next target.

## Computation

Motion coordinates should be derived from source layout, not eyeballed constants:

```ts
const origin = { x: canvasX, y: canvasY, width: canvasW, height: canvasH };
const targetCenter = { x: W / 2, y: H * 0.46 };
const dx = targetCenter.x - (origin.x + origin.width / 2);
const dy = targetCenter.y - (origin.y + origin.height / 2);
// Use interpolation of dx,dy and angle around the card's original center.
```

Calculate transforms in **composed video coordinates**. Apply CSS `transformOrigin: 'center center'`, `perspective` on parent, `transform` on actual foreground element. Avoid `rotateY` on a DOM card whose backface/text legibility makes it unreadable; use small angles, optional focal camera zoom. Keep `zIndex`/`overflow: visible` sufficient to prevent accidental clipping.

## Effect catalog (proposed)

| Preset | Real target | Parameters | Constraints |
| --- | --- | --- | --- |
| `extract-and-return` | Whole original card | path, scale, rotation, spring, pause | Exact measured origin and return |
| `focus-glow` | Card/button | outline, blur, colour, intensity | Must not change original card layout |
| `spotlight-dim` | Browser/page plate | dimOpacity, blurRadius, maskPadding | Avoid dimming foreground card |
| `cta-pulse` | True button child | scale, spring, repeat count | Don't trigger real purchase/download |
| `thumbnail-pop` | Original image child | mask, scale, parallax, z | Original image file and crop |
| `fire-particles` | Fire reaction / overlay | count, deterministic seed, gravity | VFX only, never increment live counter |
| `typed-search` | Browser action clip | keyword, cursor, rate | Recorded real page/action and response |
| `orbit-cards` | Multiple imported cards | depth, arc, spacing | Only source-mapped cards; no invented values |
| `logo-reveal` | Original logo asset | stroke/scale/opacity | Preserve original artwork |
| `camera-journey` | Composite scene | crop, pan, zoom, ease | Maintain legibility and framing |

## Source-framed cinematography

For vertical exports, do **not** simply squash or stretch a desktop site to 9:16. Choose the app's responsive mobile viewport, or compose a preserved-aspect website window within a vertical canvas and focus the active card using a camera move. Keep headline and CTA safe areas for Instagram UI; user-adjustable. Respect reduced-motion preview preference and a flash-frequency check.

## Determinism and timeline

A Remotion composition is a function of `(frame, props)`; use `useCurrentFrame`, `interpolate`, `spring`, composition props and seeded deterministic VFX. No real setTimeout, random value per frame, asynchronous unpinned fetch, CSS transitions relying on playback time, or browser-dependent scroll side effects inside render.

## Reference

[`../examples/flying-card.tsx`](../examples/flying-card.tsx) shows a generic Remotion overlay wrapper, **not** a replacement resource-card UI. Render the source component as `children`. It is a reference implementation pattern to adapt into Phase 1, not a complete production composition.
