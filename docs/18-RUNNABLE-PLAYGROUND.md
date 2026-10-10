# 18 — Running the UI Motion Playground (implementation v0.2)

> This document describes the executable implementation. The existing docs/16 and docs/17 describe additional future work. This version is **not** a universal standalone source-TSX import SDK. Its source-faithful first mode animates original website DOM in Chromium and uses Remotion to assemble captured frames.

## Windows setup

Prerequisites: Node.js 22.12+, Git, Chromium installed through Playwright and a separate authorized local website. For the first test, FiveM Resource Hub uses the real **/free** route; its API and PostgreSQL database must already be configured and running. The engine will not invent resource cards when the API is unavailable.

**Terminal 1 — source website** (inside your existing `fivem-resource-hub` directory):

```powershell
npm install
npm run dev -w @hub/web
```

If the source site needs its database/API, use that repository's own README for Docker and backend startup. Verify **http://127.0.0.1:5173/free** displays genuine resource cards.

**Terminal 2 — animation engine:**

```powershell
git clone https://github.com/Brave-developments/ui-motion-engine.git
cd ui-motion-engine
npm install
npx playwright install chromium
npx remotion browser ensure
npm test
npm run dev:playground
```

Open **http://127.0.0.1:5085**.

1. Inspect `http://127.0.0.1:5173/free` in the editor.
2. Select an actual source element such as a resource card from the visible list or its screenshot outline.
3. Enter a creative brief, select intensity, and use **Choose animation automatically**. You can manually override the resulting style.
4. Play the responsive screenshot preview, pause or scrub to an exact frame. The preview can be slower than real-time; the final MP4 includes every frame.
5. Press **Render MP4 using Remotion**. Job progress reflects screenshot capture then Remotion assembly. Download video, source manifest and QA report from the local editor.

At 30 FPS, an eight-second video requires **240 original-Chromium screenshots**. The images and exports are saved under ignored `public/renders/` and `out/`; large jobs consume substantial disk/CPU. Run a short test first and clear those folders when no longer needed.

### Optional real Gemini AI direction

```powershell
$env:GEMINI_API_KEY = "YOUR_KEY_HERE"
$env:GEMINI_MODEL = "gemini-2.5-flash"
npm run dev:playground
```

The key stays on the Node server; selected element label/type/bounds and the creator brief are sent to the Gemini API. Only validated decisions from the eight allowed styles can be applied. Without a key or on AI failure, the interface **explicitly labels** its automatic rules fallback. The engine does not falsely label local heuristics as a model response.

**Eight supported styles:** Fly Out & Return, 3D Orbit, Hero Focus, Tilt & Pop, Sweep Highlight, Bounce Focus, Cinematic Pan, Layered Reveal. AI is not confined to the two originally documented presets.

### CLI render

```powershell
npm run render:pilot -- --url http://127.0.0.1:5173/free --prompt "cinematic sci-fi orbit around a real resource card" --intensity 65
```

## What the code really does

- `server/browser.mjs`: drives the REAL React website in a clean Playwright context, reads real DOM geometry and text, selects a real element and applies per-frame CSS transforms to the **existing element**. No newly created imitation `ResourceCard` markup. CSS transforms preserve its grid slot.
- `server/motion.mjs`: deterministic frames and geometry for eight distinct effects with 0% stationary behaviour, bounded intensity and precise return endpoints.
- `server/director.mjs`: optional Gemini decision with provider-side validation or clear automatic-rule fallback. No model-produced JS is evaluated.
- `studio/`: editor with source connection, visual target picker, creative brief, controls, frame-by-frame preview and render/download.
- `remotion/` + `server/render.mjs`: save actual website screenshot frames, build a Remotion image-sequence composition and export H.264 MP4. **Remotion assembles original Chromium frames, not direct TSX imports.**
- `server/security.mjs`: localhost-only source URLs, GET/HEAD browsing to prevent accidental Fire/download writes, opt-in remote HTTPS assets, local editor binding.

## Honest current limitations and next milestones

This is a **runnable local workflow implementation**, but end-to-end MP4 export still requires verification in a real Windows environment with downloaded NPM dependencies, Chromium, Remotion browser binary and a running site. Unit tests passing does not prove a video successfully renders.

The source-faithful approach uses actual React-generated DOM pixels. It is not isolated editable React JSX. Individual card children cannot yet be detached/remixed, and a browser source may have clipping, stacking contexts or animations that make particular shots less convincing. A CSS shadow spotlight is used; true isolated backdrop blur requires separate alpha layers. A fully imported source-component adapter plus pixel-diff gate remains future work; do not claim these exist.

For production-quality video, review every export, especially font/images, card occlusion, 3D clipping and source authenticity. Source code and private database remain outside this public repository. The engine will not start the source API or scrape authenticated sessions.

## Test and developer commands

```powershell
npm test                  # existing + new pure unit tests / schema validation
npm run test:engine       # eight-style motion/director/security unit tests
npm run inspect -- --url http://127.0.0.1:5173/free --out out/inspect
npm run dev:playground    # local editor
npm run render:pilot      # source-faithful scripted video pilot
```

The browser/editor API exposes `/api/status`, `/api/inspect`, `/api/snapshot`, `/api/select`, `/api/direct`, `/api/frame`, `/api/render`, `/api/jobs/:id`, and video/manifest/qa artifacts.
