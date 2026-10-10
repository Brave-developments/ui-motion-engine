# GitHub publication and local setup

The separate repository has been created at https://github.com/Brave-developments/ui-motion-engine and the source plan is published. It was created as a **public** repository by its owner. Keep this repo distinct from the two existing private projects.

## Clone and validate

```bash
git clone https://github.com/Brave-developments/ui-motion-engine.git
cd ui-motion-engine
npm install
npm test
```

Node.js 22.12+ is required. For website inspection, install Chromium using `npx playwright install chromium`. The inspection command is documented in the README and its CLI usage.

## Real website pilot

Clone `Brave-developments/fivem-resource-hub` separately in an authorized local environment. Follow `docs/11-FIVEM-HUB-PILOT.md` and `docs/03-COMPONENT-ADAPTERS.md` to adapt actual resource cards without copying the private website into this public repository. Also keep `Brave-developments/flashcut-ai` in its own checkout.

## Release boundary

This repository currently contains design plans, runnable inspection and validation tools, schemas, test fixtures and illustrative component/animation examples. It is **not yet** an end-to-end automatic video generator; verify the full render pipeline before making such a claim. Never commit local credentials, private website source, proprietary media, recordings or generated exports.

## Source of truth

Documentation in `docs/` describes feature priority, acceptance tests, licensing and security gates. Use branches and pull requests for incremental implementation. The first milestone is a real FiveM resource card extracting and returning with frame-perfect motion and visual-fidelity checks.
