# 04 · Browser capture, element isolation and hybrid shots

## Browser capture is not the goal; it is an instrument

Playwright supplies geometry, real user interactions, screenshot references and fallback raster layers. When source imports work, the actual React card is the independently animated overlay. Use screen recording only for actions like typing/searching/scrolling that must genuinely happen in the browser.

## Exact background + detached layer recipe

1. Launch Chromium using fixed locale, timezone, DPR, viewport and reduced-motion preference; pinned browser binary if possible.
2. Navigate to an **allowed origin** and stabilize route/data/fonts/visible images. Record network failures and unavailable third-party images.
3. Set stable UI state (fixtures/read-only). Scroll to the target. Save `element.getBoundingClientRect()` and scroll offsets **for that state**.
4. Take a **reference screenshot** with the original card visible (`reference.png`).
5. Create a **background plate** by setting the target's `visibility:hidden !important` *without changing layout*, then screenshot the identical viewport (`background.png`). Always restore the original styling in a `finally` block. Never use `display:none` (would cause grid reflow).
6. Create a **foreground card layer**. Preferred: render actual source React component in the video and position at saved bounds. Raster fallback: isolate a *transparent* element + child layers in a dedicated, style-preserving offscreen context. **Important: Playwright `locator.screenshot({omitBackground:true})` does not magically make the area behind the element transparent.** An ordinary element crop often contains page pixels and rectangular artifacts. Validate alpha channel and edge quality before claiming it is independent.
7. At extraction frame, swap visible original for background plate + foreground layer in same coordinates; animate translate/scale/rotateY/z-index/shadow.
8. Return layer to measured slot, transition original back without popping, then switch to live/recorded page for further interactions.

## Alternative browser-controlled DOM portal

If the original website **explicitly supports an opt-in capture hook**, portal/clone its existing DOM element into a full-viewport top layer in the same browser. Preserve computed styles, layout box and CSS variables; leave a same-size placeholder in its original grid. Animate it using deterministic frame commands (postMessage). DOM reparenting can break inherited CSS/React portal state, pointer handlers and layout; test in source app and never patch production implicitly. A React component instance imported into a video wrapper is generally safer for this project's card animation.

## Raster fallback quality requirements

- Isolated layer has a meaningful alpha channel; inspect four corners and rounded-card edge pixels.
- No ghost/card shadow remains in `background.png`.
- If transparency cannot be produced reliably, mark `capture_only` and prefer browser footage rather than visual composites that look fake.
- Capture text/image/button as separate independent layers only if layout and styling remain pixel-faithful.
- If CSS masks, filters, backdrops, videos, canvas or cross-origin content prevent isolation, show “unsupported/needs manual layering”.

## Browser takes

Capture real search, click, scroll, filter and link navigation. Record actual response/state; never fake a successful filter. Keep recording dimensions, route, timings, selector steps, browser version, source commit and video provenance. Reuse FlashCut AI's existing product-demo recorder for initial integration (already supports declarative actions, Chromium WebM and metadata), adding only the new component-aware extraction module.

## Stability and limitations

- `networkidle` alone is **not** reliable evidence that SPAs and fonts are ready. Wait for explicit selectors, `document.fonts.ready`, image decode and stable size samples; apply timeout with visible warning.
- `getBoundingClientRect()` is CSS pixels relative to the viewport; screenshots may use DPR-scaled pixels. Normalize before placement.
- Scroll position, responsive layout, animation, sticky headers, transform parents and clipping contexts all affect coordinates.
- Cross-origin iframes are not independently inspectable without allowed access; may be footage only.
- Do not use production logins/cookies; requests to localhost are permitted only when explicitly run on the user's machine, and outgoing remote URLs must use allowlists/safe-network policy.

## Phase 0 demonstration script

`npm run inspect -- --url http://127.0.0.1:5173 --selector '[data-motion-id="resource-card"]' --out out/inspect`

It produces a real screenshot, a CSS-pixel DOM inventory, and optional element crop. **It intentionally does not fabricate transparency or claim card extraction works yet.**
