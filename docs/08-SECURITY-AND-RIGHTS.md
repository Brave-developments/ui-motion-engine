# 08 · Security, privacy, origin policy, provenance

## Threats

Importing a repository and launching it can execute arbitrary package scripts; browsing a remote page can make unauthorized network requests; HTML/script may access local metadata if browser/network is unguarded; captured screenshots can reveal sessions, personal data or API tokens; imported assets may have licensing restrictions.

## Required mitigations

- Work in an isolated local clone/working directory/container with minimal OS privileges, separate from original application and host credentials. A read-only mount **does not stop code execution**: Node scripts still need sandboxing. Inspect `package.json` first; opt in before install/build/start of untrusted project.
- Pin source to commit, dependencies to a lockfile and browser build where feasible. Don't run arbitrary `curl | sh` suggestions.
- `scripts/inspect-dom.mjs` intentionally permits only `localhost/127.0.0.1/[::1]` HTTP(S) addresses as target URLs; broader URL capture is a later, **separately secured** feature. Do not expose dev server publicly.
- Browser inspector should use clean context with **no user cookies**, no saved passwords, no browser extensions, no auth, no persistent profile. For future remote URL capture: block network requests to LAN/loopback/link-local/cloud metadata and recheck DNS/redirects; approved local targets require an explicit exception.
- API endpoints for render/inspect are localhost-only initially, authenticated if exposed remotely. Jobs have bounded frames, resolution, storage, duration, network, concurrency, worker CPU and memory.
- Render output must not include usernames, private screenshots, authentication tokens, environment files, server endpoints or sensitive admin dashboards.
- Browser action scripts are declarative (`click`, `scroll`, `fill`, `wait`, `navigate`); no user-supplied executable JavaScript, shell or CSS injection through prompt.
- Inspect but do not mutate source database, e-commerce checkout, reactions, user accounts, login sessions or social posting state. Use captured, approved read-only fixtures.
- All asset layers carry source URL or authorized repository hash, import time, creator/licence attribution when available, and an approval state. “Screenshot captured” does **not** grant publication rights.
- Strip EXIF/private paths from published package. Store project evidence in private `out/` by default. Never commit `.env`, provider keys, upload logs or captured personal data.

## Proprietary code and app integration

`fivem-resource-hub` and `flashcut-ai` are private; do not vendor their code into a new repo, publish screenshots/data or change visibility automatically. This plan's source adapters reference local checked-out files; permissions remain scoped to the user's approved environment. If a third-party website is the input, **browser capture only** and rights review before publication.

## Acceptance for any capture

Every asset must answer: *Which real source? Which version? Which state? Which permission?* Any missing answer triggers review, not an assumed license.
