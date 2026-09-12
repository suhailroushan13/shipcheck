# Spec: Project Setup

**Created**: 2026-09-12
**Status**: draft
**Author**: suhailroushan13
**Epic**: shipcheck (Feature 1)

---

## Problem

There is no repository scaffolding for ShipCheck yet — no package manager workspace, no TypeScript config, no CLI entrypoint, no test/lint/build tooling. Every subsequent feature (audit engine, checks, scoring, reporters) needs a place to live and a consistent toolchain, or each one will invent its own conventions and the codebase will fragment before it starts.

## Goal

A contributor can clone the repo, run `pnpm install`, and immediately have working `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` commands across all packages. Running the CLI (`pnpm --filter cli exec shipcheck https://example.com` or `shipcheck webcheck https://example.com`) parses arguments correctly and prints a clear "not implemented yet" message — no crash, no stack trace, no fake audit output.

## User Stories

- As a **contributor**, I want a working monorepo skeleton with lint/typecheck/test/build all green, so I can start adding a check or reporter without first fixing tooling.
- As a **maintainer**, I want the CLI's command surface (`webcheck`, url shorthand, all documented flags) to already parse correctly, so later features only need to implement behavior, not argument handling.
- As an **early adopter** cloning the repo before any checks exist, I want `shipcheck https://example.com` to fail gracefully with "not implemented yet" rather than crash, so first impressions aren't broken.

## Requirements

### Must-have
- pnpm workspace with `pnpm-workspace.yaml` covering `apps/*` and `packages/*`
- `apps/cli` — the CLI package, published as `shipcheck`, with a `bin` entry
- `packages/{core,webcheck,checks,scoring,reporters,shared}` — empty packages with `package.json`, `tsconfig.json`, and an `index.ts` that exports nothing yet (or a placeholder), each with its own `pnpm test`/`pnpm build` wired via workspace scripts
- Root `tsconfig.json` (base config, strict mode) referenced by each package's `tsconfig.json`
- Node.js engines field `>=20` enforced in root `package.json`
- ESM everywhere (`"type": "module"`, `moduleResolution: "bundler"` or `NodeNext`)
- ESLint (flat config) + Prettier configured at the root, applying to all packages
- Vitest configured at the root (workspace-aware), with at least one trivial passing test per package to prove wiring works
- CLI parses:
  - `shipcheck webcheck <url>`
  - `shipcheck <url>` (shorthand — must behave identically to `webcheck <url>`)
  - Flags: `--verbose`, `--json`, `--html <file>`, `--markdown <file>`, `--ci`, `--mobile`, `--desktop`, `--timeout <ms>`
  - Also stub the flags from the CI-mode section of the spec (`--min-score`, `--fail-on`, `--max-critical`, `--max-warnings`) so the parser doesn't reject them later — they're accepted but unused until Feature 11
- Invalid/missing URL argument produces a clear usage error (non-zero exit), not a stack trace
- Valid URL + any flag combination prints a "ShipCheck audit engine not implemented yet" message and exits 0
- Root `package.json` scripts: `lint`, `typecheck`, `test`, `build` that fan out to all workspace packages
- Root-level skeleton files exist (empty or single-line placeholder, NOT full content): `README.md` (already exists, leave as-is or note as future work for Feature 13), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `ROADMAP.md`, `CHANGELOG.md`, `LICENSE` (full MIT text — this one should be complete, it's a legal file not documentation), `.github/PULL_REQUEST_TEMPLATE.md`, `.github/dependabot.yml`, `.github/ISSUE_TEMPLATE/` (dir with a minimal default template), `.github/workflows/` (dir, can be empty or hold a placeholder CI workflow that just runs lint/typecheck/test/build on push/PR)

### Nice-to-have
- A basic `ci.yml` GitHub Actions workflow that runs `pnpm lint/typecheck/test/build` on push/PR (cheap to add now since Feature 1 already defines these scripts; full ShipCheck-specific Action is Feature 12)
- `.editorconfig` and `.nvmrc`/`.node-version` pinning Node 20

### Out of scope
- Any actual auditing logic (HTTP fetch, Playwright, Cheerio parsing, checks) — Feature 2+
- Full content for README, CONTRIBUTING, docs/*, GOOD_FIRST_ISSUES.md — Feature 13
- Scoring, reporters (terminal/JSON/HTML/Markdown) — Features 4–6, 10
- The ShipCheck-specific GitHub Action — Feature 12
- Publishing to npm / release automation

## Data Model

Not applicable — no persistence in this feature.

## API Changes

Not applicable — no HTTP API. CLI surface only (see Requirements above for the command/flag contract).

## UI Changes

Not applicable beyond the CLI's own `--help` output, which should list all commands/flags accurately (Commander/CAC generate this from the same definitions used for parsing, so no separate work needed).

## Edge Cases

1. **No URL argument at all** (`shipcheck` or `shipcheck webcheck`) → print usage/help and exit non-zero, not a crash.
2. **Malformed URL** (e.g. `shipcheck not-a-url`) → CLI should still accept it at the parsing layer in this feature (URL *validation* is Feature 2's job), but must not throw an unhandled exception — worst case it's passed through to the "not implemented" stub unchanged.
3. **Unknown flag** (e.g. `--bogus-flag`) → Commander/CAC's default "unknown option" error, non-zero exit, no stack trace leak.
4. **`--html` / `--markdown` given without a filename** → clear argument error, not a silent no-op or crash.
5. **Running via `npx shipcheck ...` before publish** (i.e. `pnpm --filter cli exec shipcheck ...` locally, or `node apps/cli/dist/index.js ...`) → the `bin` wiring and build output must actually be executable (correct shebang, correct file permissions, ESM-compatible entrypoint).
6. **Monorepo package with no source yet** (e.g. `packages/checks` before any check exists) → `pnpm build`/`pnpm test` must still pass (trivial passing test, no empty-test-suite failures in Vitest).

## Testing Criteria

**Happy path:**
- `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` all exit 0 from a clean clone
- `shipcheck webcheck https://example.com` and `shipcheck https://example.com` both print the same "not implemented yet" message and exit 0
- `shipcheck webcheck https://example.com --json --verbose --timeout 5000` parses without error

**Edge cases:**
- `shipcheck` with no args → non-zero exit, usage shown
- `shipcheck webcheck` with no URL → non-zero exit, usage shown
- `shipcheck --bogus-flag https://example.com` → non-zero exit, clear error
- Each workspace package's own `pnpm test` passes in isolation (not just via the root fan-out)

## Dependencies

- pnpm (package manager — must be installed / corepack-enabled)
- Node.js >= 20
- Commander or CAC (CLI parsing) — decide and note the choice in the plan
- TypeScript, ESLint, Prettier, Vitest (dev tooling)
- No runtime dependency on Playwright/Cheerio/Zod yet — those arrive with Feature 2, but it's fine to add them as workspace deps now if the plan phase finds it cleaner to declare them once.
