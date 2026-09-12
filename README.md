# ShipCheck

**Know if your website is ready to ship.**

Open-source, local-first CLI that audits a URL for performance, SEO, accessibility, security, UX, and technical health — then gives you a transparent, explainable score in your terminal, in CI, or as a shareable JSON/HTML/Markdown report.

```bash
npx shipcheck https://example.com
```

> **Status: early / pre-alpha.** The CLI skeleton, flag parsing, and monorepo are in place. **No auditing is implemented yet** — running the command above currently prints a "not implemented yet" message. See [Project status](#project-status--whats-pending) below for exactly what's done and what isn't. This README describes the target experience the project is building toward; nothing here should be read as a claim that a check already runs.

---

## Table of contents

- [Why ShipCheck?](#why-shipcheck)
- [Quick start](#quick-start)
- [What it will check](#what-it-will-check)
- [CLI usage](#cli-usage)
- [CI usage](#ci-usage)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Project status / what's pending](#project-status--whats-pending)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Security](#security)
- [Privacy](#privacy)
- [License](#license)

---

## Why ShipCheck?

Most "website checkers" are either a thin wrapper around Lighthouse, a paid SaaS that gates real findings behind a plan, or a black box that hands you a score with no way to see how it was computed. ShipCheck is meant to be the opposite:

- **Local-first.** Runs entirely on your machine. No account, no API key required for the core audit.
- **Transparent.** Every score traces back to real, documented measurements — see [`docs/scoring.md`](docs/scoring.md) once it exists. No invented numbers, no AI-guessed scores.
- **Honest about limits.** If a check isn't implemented, ShipCheck says "not available" instead of faking a passing score.
- **CI-friendly.** Designed from day one to gate a PR (`--ci --min-score 80`), not just print a pretty terminal report.
- **Easy to extend.** The goal is: one useful check = one easy, self-contained open-source contribution.

## Quick start

Requirements: **Node.js >= 20** and **pnpm**.

```bash
git clone git@github.com:suhailroushan13/shipcheck.git
cd shipcheck
pnpm install
pnpm build

pnpm exec shipcheck https://example.com
# or, once published: npx shipcheck https://example.com
```

Today this prints a "not implemented yet" message with the parsed URL and flags. That's expected — see [Project status](#project-status--whats-pending).

## What it will check

Once implemented (see [Roadmap](#roadmap) for sequencing), each category below becomes a set of independent, testable checks feeding into a documented weighted score:

- **Performance** — Core Web Vitals (FCP, LCP, CLS, INP, TTFB), render-blocking resources, oversized assets, compression, caching
- **SEO** — title/description/canonical/headings, Open Graph & Twitter Card metadata, structured data (JSON-LD), crawlability (robots.txt, sitemap.xml)
- **Accessibility** — alt text, form labels, ARIA basics, heading hierarchy, contrast (via axe-core) — reported as "N issues detected," never as a certification
- **Security** — response security headers (CSP, HSTS, X-Content-Type-Options, etc.), HTTPS usage, mixed content — informational only, no intrusive testing
- **UX** — deterministic heuristics: viewport meta, tiny text, oversized DOM, broken links/images, horizontal overflow
- **Technical** — HTTP status/redirects, HTTPS, favicon, canonical, broken internal links, DOM size

## CLI usage

```bash
shipcheck webcheck <url>              # explicit form
shipcheck <url>                       # shorthand, identical to the above

shipcheck <url> --verbose             # full details for every finding
shipcheck <url> --json                # machine-readable JSON report
shipcheck <url> --html report.html    # standalone offline HTML report
shipcheck <url> --markdown report.md  # Markdown report (PRs, docs, client hand-off)
shipcheck <url> --ci                  # CI mode (see below)
shipcheck <url> --mobile              # emulate a mobile viewport
shipcheck <url> --desktop             # emulate a desktop viewport
shipcheck <url> --timeout 30000       # navigation timeout in ms

# local development — audit your app before you deploy it
shipcheck http://localhost:3000
```

Run `shipcheck --help` to see the full, current flag list — it's generated directly from the CLI's argument parser, so it can never drift from what's actually implemented.

## CI usage

```bash
shipcheck https://example.com \
  --ci \
  --min-score 80 \
  --fail-on critical \
  --max-critical 0 \
  --max-warnings 10
```

`--ci` exits non-zero when the configured thresholds are violated, so it can gate a pull request. **The flags above already parse correctly today, but the actual threshold-checking logic behind `--ci` is not implemented yet** (Feature 11 in the roadmap) — right now `--ci` is accepted but has no effect.

## Configuration

Planned (not yet implemented — Feature 13+ / post-v0.2):

```ts
// shipcheck.config.ts
export default {
  url: "https://example.com",
  thresholds: {
    overall: 80,
    performance: 75,
    seo: 80,
    accessibility: 80,
    security: 80,
  },
  rules: {
    "seo.missing-og-image": "warning",
    "security.missing-csp": "error",
  },
};
```

## Architecture

```
                    URL
                     │
                     ▼
              ┌─────────────┐
              │   Crawler   │   HTTP fetch + Playwright browser context
              └──────┬──────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       HTML       Browser      HTTP
      Analysis    Analysis    Headers
          │          │          │
          └──────────┼──────────┘
                     ▼
              ┌─────────────┐
              │   Checks    │   one independent, testable check per finding type
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │   Scoring   │   documented, weighted, reproducible
              └──────┬──────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Terminal      JSON       HTML / Markdown
```

Monorepo layout (pnpm workspace):

```
apps/cli            → the `shipcheck` CLI entrypoint
packages/core       → audit engine: URL validation, HTTP fetch, Playwright context
packages/webcheck   → orchestrates checks against a target and assembles a result
packages/checks     → individual checks (one file per check)
packages/scoring    → the weighted scoring algorithm
packages/reporters  → terminal / JSON / HTML / Markdown output
packages/shared     → shared types (Category, Severity, ...)
```

## Project status / what's pending

Tracked in detail in [`.planning/epics/shipcheck.md`](.planning/epics/shipcheck.md). Current state, feature by feature:

- [x] **Project Setup** — pnpm monorepo, TypeScript strict/ESM, ESLint, Prettier, Vitest, and the `shipcheck` CLI skeleton (argument/flag parsing only, no auditing). *([PR #1](https://github.com/suhailroushan13/shipcheck/pull/1))*
- [ ] **Audit Engine Core** — URL validation with SSRF-safe protocol/host allowlisting, bounded HTTP fetch (timeout/redirect/size limits), Playwright browser context, the `Check`/`Finding` interfaces every check will implement
- [ ] **Foundational Checks** — title, meta description, H1, canonical, viewport, lang attribute, image alt text, HTTPS, core security headers, favicon
- [ ] **Scoring Engine** — documented weighted algorithm (critical/-20, major/-10, minor/-3), normalized 0–100 per category, plus an overall score
- [ ] **Terminal Reporter** — the branded terminal report shown in examples above
- [ ] **JSON Reporter** — `--json`, versioned schema
- [ ] **Performance Checks** — real browser measurements (Web Vitals, render-blocking, asset sizing)
- [ ] **Accessibility Checks** — axe-core integration plus targeted checks
- [ ] **UX Heuristic Checks** — viewport, DOM size, broken links/images, overflow
- [ ] **HTML + Markdown Reporters** — `--html`, `--markdown`
- [ ] **CI Mode** — the actual threshold/exit-code logic behind `--ci`, `--min-score`, `--fail-on`, `--max-critical`, `--max-warnings`
- [ ] **GitHub Action** — composite action wrapping the CLI, PR comments, gating
- [ ] **Docs + Contributor Experience** — full `docs/*`, `GOOD_FIRST_ISSUES.md`, issue labels, initial batch of contributor-ready issues

**In short: the plumbing exists, the actual audits don't yet.** If you run the CLI today, that's exactly what you'll see — an honest "not implemented" message, not a fake score. This is deliberate: see the project's "no fabricated functionality" rule below.

## Contributing

ShipCheck is designed so that **adding one check is one easy, self-contained contribution.** Here's exactly how to get from zero to an open PR:

1. **Fork and clone the repo.**
   ```bash
   git clone git@github.com:<your-username>/shipcheck.git
   cd shipcheck
   ```

2. **Install prerequisites.** Node.js `>=20` and `pnpm` (see `.nvmrc` for the exact Node version this repo targets).
   ```bash
   corepack enable   # if you don't already have pnpm
   pnpm install
   ```

3. **Verify your setup is clean before changing anything.**
   ```bash
   pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```
   All four should pass on a fresh clone. If they don't, that's a bug worth reporting before you build on top of it.

4. **Pick something to work on.**
   - Check the [Project status](#project-status--whats-pending) list above and the [epic](.planning/epics/shipcheck.md) for the next unclaimed feature, in order (features depend on the ones before them).
   - Or look for an open GitHub issue — once `GOOD_FIRST_ISSUES.md` exists (Feature 13), it will point at small, self-contained tasks specifically suited for first-time contributors.
   - If you're proposing something not already tracked, open an issue first to discuss scope before writing code — this avoids wasted work on something that gets redesigned in review.

5. **Create a branch** off `master` using the project's naming convention:
   ```bash
   git checkout -b feature/<short-slug>     # new functionality
   git checkout -b fix/<short-slug>         # bug fix
   ```

6. **Write the test first, then the code (TDD).** This project treats tests as the source of truth for behavior, not an afterthought:
   - Add or extend a fixture under `tests/fixtures/` if your change needs one (real HTML fixtures, not live public websites — those change and break tests).
   - Write a failing test.
   - Implement the minimum code to make it pass.
   - Every check must be able to answer: *what exactly is measured, what evidence proves the issue, why it matters, how to fix it, and how it could false-positive.* If it can't answer these, it's not ready to merge.

7. **Run the full verification suite again before opening a PR:**
   ```bash
   pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```

8. **Open a pull request against `master`.**
   - Fill out the PR template checklist.
   - Reference the epic/feature or issue it addresses.
   - Keep the PR scoped to one feature or fix — small, reviewable PRs merge faster.

9. **Respond to review.** Expect feedback on correctness, test coverage, and whether the change matches existing conventions in the codebase (once those conventions exist beyond this scaffolding). Iterate until it's green.

10. **Celebrate** — you just shipped a real, useful piece of an open-source developer tool.

See [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and [`GOVERNANCE.md`](GOVERNANCE.md) for more (these are still skeletons themselves — expanding them is itself a good first contribution).

## Roadmap

- [x] **v0.1 — WebCheck MVP** *(in progress)* — URL scanning, SEO/accessibility/security/performance/UX/technical checks, terminal + JSON output
- [ ] **v0.2** — HTML/Markdown reports, configuration file, thresholds, local dev support
- [ ] **v0.3** — GitHub Action, PR comments, baseline comparisons, regression detection
- [ ] **v0.4** — Multi-page crawling, sitemap discovery, robots.txt analysis
- [ ] **v0.5** — Plugin system, custom checks, framework integrations
- [ ] **v1.0** — Stable API and check ecosystem

Full detail: [`ROADMAP.md`](ROADMAP.md) and [`.planning/epics/shipcheck.md`](.planning/epics/shipcheck.md).

## Security

ShipCheck accepts arbitrary URLs, so its network-handling code has to defend against SSRF: blocking private IP ranges and cloud metadata endpoints for non-localhost targets, bounding redirects/response size/timeouts, and never performing intrusive exploitation (no injection payloads, no auth bypass attempts, no brute forcing). This is a hard requirement for the Audit Engine Core feature, not an afterthought — see [`SECURITY.md`](SECURITY.md) to report a vulnerability.

## Privacy

ShipCheck is local-first. No telemetry, no analytics, no account required. Your audit data stays on your machine unless you explicitly export or share a report.

## License

[MIT](LICENSE) — commercially friendly, use it however you like.
