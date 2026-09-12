# Plan: Project Setup

**Spec**: .planning/specs/project-setup.md
**Epic**: shipcheck (Feature 1)
**Created**: 2026-09-12
**Status**: draft

---

## Stack

TypeScript / Node.js (>=20, verified locally: v22.22.0) / pnpm (verified: v11.16.0) workspace monorepo, ESM. No existing code to match conventions against — this plan establishes the conventions. CLI parser: **Commander** (chosen over CAC for wider ecosystem docs/examples, first-class TS types, and built-in help generation that matches the spec's flag list well).

---

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| Root workspace config | Tooling | pnpm workspace, root tsconfig, ESLint flat config, Prettier, Vitest workspace config |
| `apps/cli` | CLI package | Owns the `shipcheck` bin, Commander program, command definitions, prints "not implemented" stub |
| `packages/shared` | Library package | Shared types/constants used across packages (e.g. `Category`, `Severity` enums referenced by later features) — created empty-but-buildable now so Feature 2+ has a home |
| `packages/core` | Library package | Placeholder for the future audit engine (Feature 2) |
| `packages/webcheck` | Library package | Placeholder for the WebCheck module orchestration (Feature 2+) |
| `packages/checks` | Library package | Placeholder for individual checks (Feature 3+) |
| `packages/scoring` | Library package | Placeholder for the scoring engine (Feature 4) |
| `packages/reporters` | Library package | Placeholder for terminal/JSON/HTML/Markdown reporters (Feature 5+) |
| Root community/legal files | Docs | Skeleton files for CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, GOVERNANCE, ROADMAP, CHANGELOG; full MIT LICENSE text |
| `.github/` scaffolding | CI/community | PR template, dependabot config, issue template dir, workflows dir with a `ci.yml` that runs lint/typecheck/test/build |

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| `pnpm-workspace.yaml` | root | Declares `apps/*` and `packages/*` as workspace packages |
| `package.json` | root | Root scripts (`lint`, `typecheck`, `test`, `build`), devDependencies (TS, ESLint, Prettier, Vitest), `engines.node >=20` |
| `tsconfig.base.json` | root | Shared strict TS config (ESM, `NodeNext` module resolution, strict, target ES2022) |
| `.eslintrc` / `eslint.config.js` | root | Flat ESLint config for TS |
| `.prettierrc` | root | Prettier config |
| `vitest.workspace.ts` | root | Vitest workspace pointing at each package |
| `.editorconfig`, `.nvmrc` | root | Editor/Node version pinning (nice-to-have from spec) |
| `apps/cli/package.json` | apps/cli | `"bin": { "shipcheck": "./dist/index.js" }`, deps on commander + all `packages/*` |
| `apps/cli/tsconfig.json` | apps/cli | Extends root base config |
| `apps/cli/src/index.ts` | apps/cli/src | Program entrypoint, shebang, registers commands |
| `apps/cli/src/commands/webcheck.ts` | apps/cli/src/commands | Defines the `webcheck <url>` command + all flags; prints not-implemented stub |
| `apps/cli/src/cli.test.ts` | apps/cli/src | Unit/integration tests for arg parsing (spawns the built CLI or calls the Commander program directly) |
| `packages/shared/package.json`, `tsconfig.json`, `src/index.ts`, `src/index.test.ts` | packages/shared | Minimal buildable package + one trivial passing test |
| `packages/{core,webcheck,checks,scoring,reporters}/package.json`, `tsconfig.json`, `src/index.ts`, `src/index.test.ts` | packages/* | Same minimal pattern, repeated per package |
| `LICENSE` | root | Full MIT license text (real content, not a placeholder) |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `ROADMAP.md`, `CHANGELOG.md` | root | One-paragraph skeleton + "full version coming in a later pass" note where content is deferred to Feature 13 |
| `.github/PULL_REQUEST_TEMPLATE.md` | .github | Minimal checklist template |
| `.github/dependabot.yml` | .github | Weekly npm + GitHub Actions update config |
| `.github/ISSUE_TEMPLATE/bug_report.md`, `config.yml` | .github/ISSUE_TEMPLATE | Minimal default templates |
| `.github/workflows/ci.yml` | .github/workflows | Runs `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` on push/PR |

## Files to Change

| File | What Changes | Why |
|------|-------------|-----|
| `README.md` | Leave existing 1-liner as-is | Full README content is explicitly Feature 13's job per spec; not touching it avoids rework |

---

## Phase 1: Root Tooling

| # | Task | Files |
|---|------|-------|
| 1 | Root `package.json` (name, private, `engines.node>=20`, `packageManager` pin, workspace scripts) + `pnpm-workspace.yaml` | `package.json`, `pnpm-workspace.yaml` |
| 2 | `tsconfig.base.json` (strict, ESM/NodeNext, ES2022 target) | `tsconfig.base.json` |
| 3 | ESLint flat config + Prettier config + `.editorconfig`/`.nvmrc` | `eslint.config.js`, `.prettierrc`, `.editorconfig`, `.nvmrc` |
| 4 | Root Vitest workspace config | `vitest.workspace.ts` |

## Phase 2: Library Package Skeletons (depends on Phase 1)

| # | Task | Files |
|---|------|-------|
| 5 | `packages/shared` skeleton (package.json, tsconfig extends base, src/index.ts exporting a placeholder `Category`/`Severity` type stub, one passing test) | `packages/shared/**` |
| 6 | `packages/core` skeleton (same pattern, no cross-deps yet) | `packages/core/**` |
| 7 | `packages/webcheck` skeleton | `packages/webcheck/**` |
| 8 | `packages/checks` skeleton | `packages/checks/**` |
| 9 | `packages/scoring` skeleton | `packages/scoring/**` |
| 10 | `packages/reporters` skeleton | `packages/reporters/**` |

## Phase 3: CLI (depends on Phase 2)

| # | Task | Files |
|---|------|-------|
| 11 | `apps/cli/package.json` + `tsconfig.json`, add `commander` dependency | `apps/cli/package.json`, `apps/cli/tsconfig.json` |
| 12 | `apps/cli/src/index.ts` — Commander program root, registers `webcheck` command, adds top-level default-command behavior so `shipcheck <url>` == `shipcheck webcheck <url>` | `apps/cli/src/index.ts` |
| 13 | `apps/cli/src/commands/webcheck.ts` — defines all flags (`--verbose --json --html <file> --markdown <file> --ci --mobile --desktop --timeout <ms> --min-score <n> --fail-on <level> --max-critical <n> --max-warnings <n>`), validates URL is present, prints the "not implemented yet" stub and exits 0 | `apps/cli/src/commands/webcheck.ts` |
| 14 | `apps/cli/src/cli.test.ts` — tests covering all edge cases from the spec | `apps/cli/src/cli.test.ts` |

## Phase 4: Root Docs/Community Skeletons (parallel with Phase 3, depends only on Phase 1)

| # | Task | Files |
|---|------|-------|
| 15 | `LICENSE` (full MIT text), `CHANGELOG.md` skeleton (Keep a Changelog format, `[Unreleased]` header) | `LICENSE`, `CHANGELOG.md` |
| 16 | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `ROADMAP.md` one-paragraph skeletons | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `GOVERNANCE.md`, `ROADMAP.md` |
| 17 | `.github/PULL_REQUEST_TEMPLATE.md`, `.github/dependabot.yml`, `.github/ISSUE_TEMPLATE/bug_report.md` + `config.yml` | `.github/PULL_REQUEST_TEMPLATE.md`, `.github/dependabot.yml`, `.github/ISSUE_TEMPLATE/*` |
| 18 | `.github/workflows/ci.yml` (lint/typecheck/test/build on push + PR) | `.github/workflows/ci.yml` |

## Phase 5: Verification (depends on all above)

| # | Task | Files |
|---|------|-------|
| 19 | Run `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build` end to end, fix any wiring issues | (no new files — fixes only) |
| 20 | Manual CLI smoke test: `node apps/cli/dist/index.js https://example.com` and via `pnpm --filter cli exec shipcheck ...` | (no new files) |

---

## Parallel vs Sequential

| Parallel Group | Tasks | Why |
|---------------|-------|-----|
| Group A | 5, 6, 7, 8, 9, 10 | Independent package skeletons, identical pattern, no cross-deps |
| Group B | 15, 16, 17, 18 | Independent docs/CI files, no code dependency |

| Sequential | Depends On | Why |
|-----------|-----------|-----|
| Tasks 2–4 | Task 1 | Need root `package.json`/workspace declared first |
| Tasks 5–10 | Tasks 1–4 | Packages extend the base tsconfig and are picked up by the Vitest workspace |
| Tasks 11–14 | Tasks 5–10 | CLI package.json declares deps on the other workspace packages (even if unused yet, to prove workspace linking works) |
| Task 19 | Tasks 1–18 | Full verification needs everything in place |
| Task 20 | Task 19 | Needs a successful build |

---

## Testing Plan

| Test | Covers |
|------|--------|
| `packages/*/src/index.test.ts` — trivial passing assertion | Spec edge case 6: empty packages still build/test cleanly |
| `apps/cli/src/cli.test.ts`: `webcheck <url>` and `<url>` shorthand produce identical output | Spec requirement: shorthand behaves identically to `webcheck` |
| `apps/cli/src/cli.test.ts`: no args → non-zero exit + usage | Spec edge case 1 |
| `apps/cli/src/cli.test.ts`: `webcheck` with no URL → non-zero exit + usage | Spec edge case 1 |
| `apps/cli/src/cli.test.ts`: malformed URL string passed through without throwing | Spec edge case 2 |
| `apps/cli/src/cli.test.ts`: unknown flag → non-zero exit, no stack trace | Spec edge case 3 |
| `apps/cli/src/cli.test.ts`: `--html`/`--markdown` without filename → argument error | Spec edge case 4 |
| Manual: built CLI runs via `node dist/index.js` and via workspace `exec` | Spec edge case 5 (bin wiring, shebang, ESM entrypoint) |
| Root scripts: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` from clean clone | Spec's overall success bar |

---

## Gate 2 Checklist

- [x] Follows a consistent, conventional pnpm/TS monorepo pattern (no existing codebase conventions to conflict with)
- [x] Layering: CLI (`apps/cli`) depends on library packages; library packages don't depend on the CLI — matches the eventual layered architecture (Controller-ish CLI → Manager-ish core/webcheck → Repository-ish reporters/checks) even though those layers are empty stubs today
- [x] Components are in the right directories per the spec's required repo structure
- [x] All files to change/create are listed
- [x] Each task touches ≤3 files and is one logical commit
- [x] Dependencies between tasks are explicit (Phase table + Parallel/Sequential table)
- [x] Parallel vs sequential tasks marked
- [x] Package-level tests planned (Phase 2 tasks)
- [x] CLI integration tests planned (Task 14), covering all 6 spec edge cases
- [x] No UI to test (CLI-only feature)

Gate 2: **passed**.

---

## Next Steps

- Build: `/spartan:build project-setup` (or proceed directly — this is a small, low-risk, 20-task scaffolding feature well within a single build pass)
