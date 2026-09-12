# Epic: ShipCheck

**Created**: 2026-09-12
**Status**: planning
**Owner**: suhailroushan13

---

## Why

Developers ship websites without a fast, trustworthy way to answer "is this actually ready?" ShipCheck is an open-source, local-first CLI that audits a URL for performance, SEO, accessibility, security, UX, and technical health, and reports transparent, explainable scores in the terminal, in CI, or as shareable JSON/HTML/Markdown reports. No account, no telemetry, no cloud dependency for the core audit.

---

## Success Criteria

- [ ] `npx shipcheck https://example.com` runs a real audit (no fabricated scores) and prints a readable terminal report in a few seconds
- [ ] `--json`, `--html <file>`, `--markdown <file>` all produce complete, spec-shaped reports from the same underlying findings
- [ ] `--ci --min-score 80 --fail-on critical` exits non-zero when thresholds are violated, so it can gate a GitHub Actions PR check
- [ ] A new contributor can add one check (e.g. `checks/seo/missing-og-image.ts` + fixture + test) by following `docs/adding-a-check.md` alone

---

## Features

| # | Feature | Status | Spec | Plan | Depends On |
|---|---------|--------|------|------|------------|
| 1 | Project Setup | done (PR #1, merged) | [spec](../specs/project-setup.md) | [plan](../plans/project-setup.md) | — |
| 2 | Audit Engine Core | todo | — | — | #1 |
| 3 | Foundational Checks | todo | — | — | #2 |
| 4 | Scoring Engine | todo | — | — | #3 |
| 5 | Terminal Reporter | todo | — | — | #4 |
| 6 | JSON Reporter | todo | — | — | #4 |
| 7 | Performance Checks | todo | — | — | #2 |
| 8 | Accessibility Checks | todo | — | — | #2 |
| 9 | UX Heuristic Checks | todo | — | — | #2 |
| 10 | HTML + Markdown Reporters | todo | — | — | #4, #5 |
| 11 | CI Mode | todo | — | — | #5, #6 |
| 12 | GitHub Action | todo | — | — | #11 |
| 13 | Docs + Contributor Experience | todo | — | — | all |

---

## Feature Briefs

### Feature 1: Project Setup
pnpm workspace monorepo (`apps/cli`, `packages/{core,webcheck,checks,scoring,reporters,shared}`), TypeScript strict + ESM, ESLint/Prettier, Vitest, and a CLI entrypoint (Commander/CAC) that parses `shipcheck webcheck <url>` and the `shipcheck <url>` shorthand but doesn't audit anything yet. `pnpm lint/typecheck/test/build` all pass on an empty skeleton.

### Feature 2: Audit Engine Core
The plumbing every check depends on: URL validation with an SSRF-safe protocol/host allowlist (blocking private IPs and cloud metadata endpoints for non-localhost targets), a bounded HTTP fetch (timeout, max redirects, max response size), a Playwright browser context, the shared `AuditContext` object, and the standardized `Check`/`Finding` interfaces that all future checks implement against.

### Feature 3: Foundational Checks
The first real, testable checks proving the engine works end-to-end: title, meta description, H1, canonical, viewport meta, lang attribute, image alt text, HTTPS usage, core security headers, and favicon. Each has a fixture and unit test per the false-positive policy (section 28).

### Feature 4: Scoring Engine
Deterministic, documented weighting (critical/-20, major/-10, minor/-3, info/0) normalized to 0–100 per category, plus an overall score. Fully explainable — `docs/scoring.md` describes exactly how any displayed number was derived.

### Feature 5: Terminal Reporter
The primary UX: the boxed SHIPCHECK header, per-category scores, overall ship score, top-priority findings with severity icons, progress indicators during the scan, and terminal-width-aware, CI-safe (no unnecessary animation) output.

### Feature 6: JSON Reporter
`--json` outputs the versioned, machine-readable report shape (scores, summary counts, findings array) matching the schema in section 19, for scripting and the future GitHub Action.

### Feature 7: Performance Checks
Real browser measurements via Playwright/Lighthouse-derived data: FCP, LCP, CLS, INP, TTFB, DOM/load timings, transfer sizes, request counts, render-blocking resources, oversized/undimensioned images, excessive JS/CSS, compression and cache-control gaps — each surfaced with real evidence, not invented numbers.

### Feature 8: Accessibility Checks
axe-core integration plus targeted checks: missing/empty alt text, unlabeled form fields and buttons/links, missing document language, heading hierarchy, duplicate IDs, and reachable contrast checks — always framed as "N issues detected," never "fully accessible."

### Feature 9: UX Heuristic Checks
Deterministic heuristics only: missing viewport meta, tiny text, oversized DOM, broken images/internal links, empty links/buttons, horizontal overflow, missing favicon — explicitly labeled as heuristics, not a claim of measured UX quality.

### Feature 10: HTML + Markdown Reporters
A fully offline, dependency-free standalone HTML report (`--html report.html`) with scores/findings/evidence/recommendations, and a Markdown report (`--markdown report.md`) suited for PR comments and client hand-off.

### Feature 11: CI Mode
`--ci` plus `--min-score`, `--fail-on`, `--max-critical`, `--max-warnings` flags that turn the audit into a gate with documented, stable exit codes.

### Feature 12: GitHub Action
A composite action (`.github/actions/`) wrapping the CLI: runs the audit, generates JSON + Markdown, comments on the PR, and fails the check per configured thresholds. README examples avoid hardcoding a GitHub org/username.

### Feature 13: Docs + Contributor Experience
README (why/quickstart/example/checks/CLI/CI/config/architecture/contributing/roadmap/security/license), CONTRIBUTING.md, GOOD_FIRST_ISSUES.md, docs/{architecture,checks,scoring,contributing,adding-a-check}.md, CODE_OF_CONDUCT.md, SECURITY.md, GOVERNANCE.md, ROADMAP.md, CHANGELOG.md, MIT LICENSE, GitHub issue templates/labels, and an initial batch of "good first issue"-shaped GitHub issues.

---

## Risks

- **SSRF / abuse surface** — ShipCheck accepts arbitrary URLs; the audit engine (#2) must land network isolation (private IP/metadata blocking, size/redirect/timeout limits) before any check work begins, per section 36.
- **Fake or unexplainable scores** — every category score must trace to real measurements (section 42). No check ships without a fixture + test proving it isn't a false positive (section 28).
- **Playwright flakiness in CI** — performance/accessibility checks run a real browser; timing-sensitive assertions need generous, documented tolerances and local HTTP fixture servers instead of live public sites (section 27).
- **Scope creep** — the spec describes a full v1.0 (plugins, multi-page crawl, baseline diffing). This epic covers only phases 1–13 (v0.1/v0.2-ish scope); later phases (baseline mode, multi-page crawl, plugin API) are intentionally deferred to future epics.

---

## Notes

- Stack: TypeScript, Node.js ≥20, pnpm, ESM build target, Commander/CAC, Playwright, Cheerio, Vitest, Zod, Chalk/Colorette, Ora.
- License: MIT. No telemetry by default.
- Source spec: full ShipCheck product spec pasted into the initiating conversation (2026-09-12), covering sections 1–43 (product philosophy through final goal).
