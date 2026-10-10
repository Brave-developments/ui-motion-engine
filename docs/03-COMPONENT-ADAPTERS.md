# 03 · Genuine React component reuse

## What “use the exact website UI” means

Use the **existing function/class component, real CSS, images, typography, props and composition**, not a new JSX markup with similar spacing. A component may still need a *thin adapter* that provides its routing context, data, hooks and dependencies. That adapter may never impersonate the design; it may only wire imports, props/state and deterministic fixtures.

## Repo discovery

- Read `package.json`, workspace layout, lockfiles, bundler config, path aliases, React and router versions.
- AST walk (TypeScript compiler or ts-morph) for exported components, imports, component props, styles and context/providers. AST inference is *best effort*; dynamic imports/render props cannot always be mapped statically.
- Run the site and use Playwright to list visible landmarks/cards. Record role, text, img src, CSS bounds, computed styles and `data-motion-id` identifiers. Map candidates to exports through source maps/devtools metadata where feasible; **don't fabricate source paths**.
- Rank candidate as `direct`, `needs_adapter`, `screenshot_only` or `unresolved`. Surface any missing assets, fonts, providers and API.

## Integration choices

**Approach A1 — Same React app, Remotion integrated:** add an isolated *opt-in* entry point referencing the website's components under the **site's current React version**. This often maximizes CSS parity, but requires a compatible Remotion toolchain and can burden the website. Develop in a separate branch; never ship render routes or capture APIs to production unknowingly.

**Approach A2 — Sidecar video workspace with source imports:** local clone at a pinned commit; `packages/adapters/hub` resolves source files through aliases. Configure bundler to process TSX, CSS modules/global CSS, SVG, assets, PostCSS/Tailwind, aliases and fonts. Install required providers in a `VideoHost` tree; inject read-only snapshot data. Compare screenshot parity before proceeding.

**Approach A3 — Original component in a separate browser island:** when bundler/React versions conflict, run the real app in a **controlled** local browser at a pinned state. Capture the specific card/layers or render a separate element through its native runtime and compose the resulting layer into Remotion. This loses direct access to Remotion-frame-driven child JSX unless a messaging/seekable-frame adapter is added. Never claim A3 is the same as direct React import.

## React version incompatibility: first pilot warning

Verified on 2026-10-10 in private repos:
- `fivem-resource-hub/apps/web/package.json`: React and React DOM `^18.3.1` (Vite `^6.0.5`).
- `flashcut-ai/package.json`: React/DOM `^19.2.0`, Remotion `4.0.534`.

**Do not copy `ResourceCard` directly into FlashCut and install both React versions in one component tree.** React hooks and context may break across duplicate React instances; dependencies can require incompatible runtimes. Prove A1/A2 on an isolated source-specific render workspace pinned to compatible React + Remotion versions. If impossible, use A3 or layer capture. Integrate exported motion MP4/assets with FlashCut first.

## Provider checklist per component

```
[ ] Original import path and Git commit
[ ] React version, ReactDOM version, bundler version
[ ] CSS globals, modules, Tailwind config, postcss and CSS variables
[ ] Fonts loaded and metrics verified (document.fonts.ready)
[ ] Logos, thumbnails, SVGs, remote assets cached/pinned
[ ] Router context, search params and link behavior
[ ] Auth/user context replaced by a permitted read-only fixture
[ ] API calls replaced by approved captured data; network disabled during render
[ ] Responsive dimensions and overflow/z-index behavior
[ ] Portals/modals and pseudo-elements
[ ] Dynamic motion/clocks/rand disabled or frame-driven
[ ] DOM reference is visually identical at relevant video frame
```

## Integration contract (proposed)

The adapter exports `Component`, `VideoHost`, `getProps(snapshot)`, `getChildSelectors()`, `canonicalCss`, and `validate(snapshot)`. It must render the **real** imported component unchanged. Optional explicit `videoOverrides` may hide hover-captured tooltips, adjust data fetching to snapshot mode or pause animations, but must not redefine markup/styles. Guard writes by passing an inert event handler and disabling mutation actions.

Example adapter outline in [`../examples/component-adapter.tsx`](../examples/component-adapter.tsx). The import path is a **placeholder** until the actual card component is found, not an assertion that such a path exists.

## Stateful components

Capture a *snapshot contract*: selected resource id, text fields from real source, Fire count, thumbnail URL + hash, selected filter, open menu state, locale and display mode. Make snapshots explicitly timestamped and immutable. For button animation, highlight or emit visual particle effects without invoking a real server mutation. Build a “state montage” only from verified snapshots; do not invent before/after numbers.
