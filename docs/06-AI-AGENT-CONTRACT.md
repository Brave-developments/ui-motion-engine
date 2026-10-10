# 06 · AI implementation and director agents

## Guiding rule

AI is a **director and integrator**. It may inspect, select, schedule, adjust effects and create approved adapters. It must **not redesign or fabricate the user's existing website**. All website elements seen in the output must be traceable to source components/DOM/authorized assets. User-entered promotional captions are distinguishable from source UI.

## Recommended agents

**1. Source Auditor (read-only)**: inspect authorized repository root, lockfiles, asset paths, React tree and related run scripts; determine React/bundler compatibility; produce manifest target candidates and issues. Do not run unknown install scripts without user consent in sandbox.

**2. Browser Mapper (restricted)**: start approved local site, capture stable screenshots, bounding boxes, component states, selectors; report missing fonts/404s, no hidden login/session scraping; prefer `data-motion-id` only if source has such IDs.

**3. Adapter Engineer**: for each selected component, produce smallest wrapper importing original React component; supply providers/fixture snapshot; preserve styles; verify pixel parity. Never write fresh `ResourceCard` JSX. If adapter fails, record error and propose B/C.

**4. Storyboard Director**: plan typed operations referring exclusively to `manifest.components[].id` and available effects; note why per-shot strategy is A/B/C; output JSON validated by schema; do not invent website claims.

**5. Motion Composer**: implement approved storyboard in Remotion with deterministic timeline; no production writes. Maintain source bbox, camera transform and render traces.

**6. QA Agent**: compare target screenshots and keyframes, check card disappearance/reappearance, missing assets, title accuracy and render errors. Failure blocks `ready` unless human acknowledges exception.

## Agent I/O and human approvals

Inputs: exact project root, known Git SHA, allowed local origin, screenshot(s), viewport, user creative direction, and selected IDs. Outputs: source manifest, a plan, per-shot rationale, adapter diff, rendered preview frames and QA report. Approval gates: source execution (deps/scripts), fallback to raster, changed branding/data, publishing or using third-party assets. No source repository writes unless explicitly separately approved.

## Structured decision rules

```text
IF original component is identifiable AND renders with pixel-parity
  → A: original React component.
ELSE IF DOM can be isolated cleanly as transparent/card-free layers
  → offer B: raster extracted layer, label it raster.
ELSE IF real browser can be recorded safely
  → offer C: browser take, label it footage.
ELSE
  → visibly block scene, request different target.
NEVER generate new JSX pretending to be the website.
```

## Director prompt skeleton

```text
You are a cinematic director with no license to alter the source website UI.
You will receive: verified manifest, permitted operations, per-target renderability,
source screenshots, viewport, and a user's motion brief.
Return ONLY structured storyboard JSON conforming to specs/storyboard.schema.json.
Reference existing target IDs, accurate real text/images, bounded durations,
and original assets. Do not fabricate components, resource statistics, clicks,
backend state, logos or downloads. Prefer live-component mode; explain any fallback.
Mark assertions/copy requiring human review. Include start and end layouts
that match measured site geometry. On unsupported request, return a warning.
```

## Engineering agent execution policy

- Work from a new branch, small commits, tracked test evidence, no source repo mutation until a separate PR review.
- Do not claim tests pass unless run in appropriate environment.
- Before every implementation phase read `README`, `ARCHITECTURE`, `COMPONENT-ADAPTERS`, `CAPTURE-AND-EXTRACTION`, `QUALITY-AND-TESTS` and current acceptance gate.
- Update roadmap checkboxes only when proof links and screenshot comparisons exist; preserve existing `flashcut-ai` behavior.
