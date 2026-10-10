# 09 · Tests, visual parity and acceptance gates

## Three levels of tests

**1. Structural:** JSON Schema for manifest and storyboard; known target IDs; nonnegative rects and durations; no duplicate IDs; all source image URLs hashed; all scene methods declared; no original UI reimplementation.

**2. Visual:** Playwright reference screenshot at same app commit, route, state, viewport, DPR, fonts. Render same unanimated composition frame. Compare pixel diff with mask only for truly dynamic pixels (caret, timestamp, remote avatar). Report metrics plus source/candidate/diff contact sheet. Don't require one global magic percentage: use baseline-tuned visual thresholds and human review; flag any missing image, text or font immediately. Compare at least first, mid, extraction swap and return frames.

**3. Behavioural:** Playwright UI E2E, Remotion frame renders, 30-second MP4 metadata (codec, dimensions, fps, audio when provided), scene/order checks, duplicate-card detection, state/asset provenance and reproducibility under repeated render.

## Tests for the card extraction proof

- `P0`: exact React repository commit / local URL / chosen viewport known. Card present in real screenshot. Inspector records a nonzero CSS rect and stable element selector.
- `P1`: original card render has same layout, image, type, text and background as real screenshot; child elements accessible when claimed.
- `P2`: at f0, exact same scene as site; at extraction swap the card is NOT visibly doubled; its source slot does not collapse or make adjacent cards move.
- `P3`: at hold, independently animate a genuine child (e.g. Fire icon) WITHOUT backend mutation. No fake reaction increment.
- `P4`: on return, card aligns with original slot within a perceptually invisible tolerance; render preview first and last frames side by side.
- `P5`: final video plays at requested resolution and fps, without clipped labels/artifacted rounded corners.
- `P6`: rerender with same pinned inputs yields identical sampled frame hashes (or documented expected small codec differences for MP4 encoding).

## Cross-case test matrix

| Case | Expected behaviour |
| --- | --- |
| Desktop viewport, React import works | Tier A, child effects permitted |
| Mobile viewport, responsive card rearranged | New measured bbox, no reused desktop coordinates |
| CSS fonts missing | Explicit `FONT_MISMATCH`, block ready |
| Component imports duplicate React 18/19 | `RENDERER_INCOMPATIBLE`, show adapter or tier fallback |
| API down | Error shown; don't replace with imaginary resources |
| Element hidden/0×0 | Target unsupported at current state |
| Nontransparent crop | `CAPTURE_NONTRANSPARENT`; do not claim independent alpha |
| Parent transform or sticky scroll | Recalculate matrix or block parity |
| Live site and pinned snapshots disagree | Warn; user chooses refreshed source capture |
| Remote blocked/private network redirect | Refuse capture except separately authorized local workflow |
| Source card contains title/thumbnail | Actual values preserved in exported movie |
| Long hero text in vertical video | Preserve aspect and choose a crop or layout-safe framing |

## Definition of “done”

A scene is finished only when preview, visual reference, accepted mismatch report and independently replayable render are saved. Passing tests in a synthetic demo site alone is **not** proof that FiveM Resource Hub itself works. Do not claim end-to-end completion until the real pilot has passed.
