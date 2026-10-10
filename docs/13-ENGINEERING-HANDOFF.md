# 13 · Implementer handoff (paste as one agent task)

You are building the **UI Motion Engine** in this repository. Your work must produce cinematic Remotion videos using the *actual React components from an authorized source website*. The previous failure was generating brand-new React cards/hero sections inspired by the website. **Do not repeat that mistake.**

## Scope of first PR

Implement only Phase 0 + Phase 1 from `docs/10-ROADMAP.md`. Do **not** build complex AI, dashboard, payment, auth, hosting or social-publishing integrations yet.

1. Read all project docs, especially source integrity, adapter strategies, motion coordinates and QA criteria.
2. Inspect actual private repo `Brave-developments/fivem-resource-hub` through a **separately authorized local checkout**. Pin a Git commit. Inspect `apps/web`, actual card implementation and CSS/assets. Do not assume `ResourceCard.tsx` exists.
3. Start legitimate local app and capture authentic reference at a fixed viewport. Run `scripts/inspect-dom.mjs` and improve manifest with stable selector, CSS rect and chosen source component mapping. Use backend-approved read-only snapshot data; no fake example resource in screenshots.
4. Determine whether Remotion component import is feasible under site's React 18 runtime; FlashCut is React 19, so **do not merge React runtime trees**.
5. Implement `VideoHost` with original CSS/fonts/assets/providers, import the actual existing card code, pass authentic props. A wrapper is permitted; recreating the card's JSX/CSS is forbidden.
6. Compare original vs unanimated video frame. If they do not look identical, diagnose rather than fabricate.
7. Implement source card extraction/3D tilt/scale/glow, optional actual Fire child animation without server write, and exact return. Use `visibility:hidden` only to keep grid placeholder/background; never `display:none`.
8. Add deterministic timeline test, screenshot parity tests, final MP4 render and transparent status report. If direct import cannot work, document the failure and propose clean DOM-layer fallback **with user-visible warning**.
9. Save source-commit hash, viewport, screenshot reference, adapter diff, trace, sample video, pixel diff and test instructions in the PR.

## Constraints

- Source React + CSS and assets are visually authoritative.
- Never invent source UI, data, Fire counts, downloads, online status or thumbnails.
- Never modify the FiveM site repo or FlashCut without separately approved PR.
- Never commit tokens/`.env`/personal browser sessions or proprietary source into this repo.
- No external media usage without attribution/rights review.
- Deterministic video frames; no uncapped external network requests or side effects during render.
- Tests must be run and their output accurately reported. A failure cannot be described as complete.

## Mandatory PR response format

1. Source files/commit inspected (exact paths).
2. Chosen technique A/B/C and why.
3. What now works and what is still blocked.
4. Original screenshot vs Remotion screenshot side by side.
5. What happens at extraction and return boundary frames.
6. Commands tested, actual exit statuses and render metadata.
7. Any source compatibility, font, crop, rights or API caveats.
8. Next smallest action, not a premature overhaul.

## Deliverable quality bar

A real resource card flies out of a real website, visibly retains original type/spacing/thumbnail/icons, can be independently animated, and returns to exact measured grid position with no reflow. All this must be proven by screenshots/render checks, not verbal assurance.
