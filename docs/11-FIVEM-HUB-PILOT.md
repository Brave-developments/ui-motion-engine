# 11 · First pilot: FiveM Resource Hub

## Verified (from connected private GitHub repo on 2026-10-10)

- Repository `Brave-developments/fivem-resource-hub`, default `main`, **private**.
- Root `package.json`: npm workspace `apps/*`. Run web: `npm run dev -w @hub/web`; combined repo also starts API/server/streamer workers.
- `apps/web/package.json`: `@hub/web`, React/ReactDOM `^18.3.1`, Vite `^6.0.5`, React Router `^7.1.1`, TypeScript.
- Root `ARCHITECTURE.md`: React website, Fastify backend, PostgreSQL, independent workers. The browser UI must show failure states when the API fails, not fake data.
- Root `README.md`: local web `http://localhost:5173`, API `http://localhost:8787`, postgres via Docker, credentials in ignored `.env`, original design `design/final-ui-reference.png`.
- Important: `ResourceCard.tsx` is **not yet confirmed** as a real file; prior sample component paths were illustrative. Locate it before writing any import paths.

## Safe pilot setup

Clone at pinned SHA in dedicated directory; keep existing app environment intact. Start with exact resource records available from the owner's permitted local test environment. Do **not** copy `.env`, credentials, private database or full site code into this new repo. Ensure image rights/attribution.

For the isolated website dev server:

```bash
# Execute in authorized fivem-resource-hub clone, NOT in this repo:
npm ci
npm run dev -w @hub/web
# then in ui-motion-engine:
npm run inspect -- --url http://127.0.0.1:5173 --out out/hub
```

If the website requires API/Docker to display real cards, follow its own existing README and configured secrets policy; **do not invent temporary resource listings**. The inspector may show a legitimate error state until backend is started. Once visible, use a real card locator selected from the `out/hub/inspect.json` candidates, or add user-approved capture selectors in a separate branch.

## Planned scenes

1. Site homepage hero; authentic logo and navigation.
2. Resource-card extraction, hover/glow, Fire icon pulse, spring return; exact source React card; no DB mutation.
3. Search field type and real filtering on genuine dataset (browser take).
4. Resources/server/streamer section with authentic thumbnails. Do not invent online status or engagement.
5. Original logo and creator-supplied CTA.

## Source adapter tasks

- Identify real card implementation in `apps/web`, which may be inline JSX.
- Identify route, CSS and asset imports, display props, Fire interaction and associated child DOM.
- Decide video-safe props and whether card needs a router/provider wrapper.
- Render source card in a Remotion-compatible React 18 environment. Check screenshot for CSS/fontrender mismatches.
- Capture card-free background with preserved grid width/height; align and animate.
- Run screenshot comparison with same Git SHA, viewport, browser fonts/data and recorded state.

## Pilot acceptance

Video must show the very same resource thumbnail/title/visual styling that the source card shows. Unavailable live streamer status is never replaced with invented “LIVE” badges; similarly, no fake reaction increments/download totals. Attach preview screenshots and render trace in the pilot test report.
