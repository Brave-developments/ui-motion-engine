# 07 · Editor / control surface specification

## Workspace panels

**Project:** source path, pinned commit, running local URL, fps/aspect, privacy flags, build status, import diagnostics. **Site Explorer:** routes and real browser preview. Hover/click to select exact DOM nodes, display CSS source selector, component import evidence, renderer readiness. **Targets:** real component thumbnail, original vs isolated screenshot, linked asset files, child parts and confidence. **Storyboard:** human text brief, AI proposal and shot-by-shot method badge `LIVE`, `RASTER`, `RECORDING`. **Timeline:** website take track, independent UI-object tracks, VFX/annotations, logo/text overlays, VO/music/subtitles. **Inspector:** x/y/scale/rotation/blur, motion curve, start/end source slots and visual-diff result. **Output:** per-frame preview, render progress, export/QA history.

## Core actions

1. Add site repo by local folder path or authorized GitHub clone; default source read-only.
2. Run **Inspect** and see raw reference screenshot with selectable targets.
3. Click real resource card in browser preview; show its source provenance and renderability badge.
4. Choose **Extract**, pick animation preset, adjust motion curve + aspect fit.
5. Press **Preview**; show original/source and candidate side by side with discrepancy overlay.
6. Add browser action to separate track (`scroll`, `type`, `click`), no arbitrary JS field.
7. Voiceover/script, captions and SFX are optional, not a prerequisite for motion.
8. Export MP4 and supporting JSON; opt-in **Send to FlashCut** later via file import.

## Manual escape hatches

- The user can adjust origin rectangle and camera focal point if automatic mapping is off.
- If the card has no isolated props/child selectors, offer whole-card animation plus VFX, not fake button internals.
- Any “AI auto” operation is reviewable: original asset ID, chosen effect, method, expected output and warnings.
- Render failures retain existing project and do not silently replace work with a new invented layout.

## Save schema and undo

Immutable versioned project file containing `sources[]`, `manifest`, `storyboard`, layer definitions, keyframe parameters, script/subtitle timestamps, render settings, approvals and warnings. Use autosave + undo/redo; migrations instead of overwriting FlashCut project files. Preserve media provenance and relative paths; never persist secrets or auth cookies.

## UX edge cases

Render badge remains `not_verified` until actual parity proof succeeds; project browser can show responsive/desktop breakpoint previews; inspect empty API state without inserting placeholder data; browser route may require local Docker/Postgres — show startup instructions and error rather than fake listing.
