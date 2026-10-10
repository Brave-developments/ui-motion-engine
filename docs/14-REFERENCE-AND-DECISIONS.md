# 14 · Technical decisions, assumptions and references

## Decisions

- **ADR-001:** Original React components > layered original DOM capture > real browser take. No AI-created approximate UI.
- **ADR-002:** Independent engine repo, no vendoring private source or modifying original site by default.
- **ADR-003:** Remotion is timeline/effects/render engine, not a magic web-to-editable-components extractor.
- **ADR-004:** React 18/19 mismatch is a real integration risk. Prove source-specific render workspace before integrating with FlashCut.
- **ADR-005:** DOM extraction geometry is viewport CSS pixels. Store source viewport and camera transform; no unqualified pixel positions.
- **ADR-006:** Browser element screenshots **do not imply transparency**. Real raster-alpha isolation needs its own verification.
- **ADR-007:** AI returns validated target IDs/storyboards; human/source-specific render passes visual parity gate.
- **ADR-008:** Use browser recording only for genuine interaction or fallback; source component extraction is the signature effect.
- **ADR-009:** Initially local/private; decide license and deployment later.

## Research references (official docs)

- Remotion compositions: https://www.remotion.dev/docs/terminology/composition
- Remotion `interpolate`: https://www.remotion.dev/docs/interpolate
- Remotion `spring`: https://www.remotion.dev/docs/spring
- Remotion `Sequence`: https://www.remotion.dev/docs/sequence
- Remotion `staticFile`: https://www.remotion.dev/docs/staticfile
- Remotion `delayRender`: https://www.remotion.dev/docs/delay-render
- Remotion Tailwind integration: https://www.remotion.dev/docs/tailwind
- Playwright locator screenshots: https://playwright.dev/docs/api/class-locator#locator-screenshot
- Playwright element bounding box: https://playwright.dev/docs/api/class-locator#locator-bounding-box
- Playwright screenshots: https://playwright.dev/docs/screenshots
- Playwright videos: https://playwright.dev/docs/videos
- Node/TypeScript docs: https://www.typescriptlang.org/docs/
- Source repos (private): https://github.com/Brave-developments/fivem-resource-hub and https://github.com/Brave-developments/flashcut-ai

## Technical uncertainties that MUST be inspected, not guessed

1. Where is the actual card JSX/component and how is CSS applied? Does it export a reusable function?
2. Does backend supply props or does card hook into API/router/global state?
3. Can Remotion bundler import the source's CSS/image modules without incompatibilities?
4. Does source React 18 and Remotion currently selected release work in a matching isolated environment? Which render approach is cleanest?
5. How will an isolated transparent card image be generated for raster fallback without surrounding pixels?
6. What is a suitable pixel-parity tolerance given font rendering and responsive elements?
7. Does the source route require Docker/API to show its authentic, real resource data?

## No invented features

The repository documents a **proposed** engine, not a currently shipping automatic parser. `inspect` and `validate` are real starter utilities. No media recorder, Remotion studio or automatic component extractor is declared implemented here.
