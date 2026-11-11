# Contributor verification results

Ticket 03 validates the contributor-command and Git-hook boundaries by executing
the tools, not by asserting configuration text. Temporary violations and staged
fixtures are isolated from the contributor's working tree and are not committed.

## Local results

Verified on **2026-11-12**, macOS arm64, Node **24.14.0**, pnpm **12.11.2**,
Biome **2.6.6**, and Lefthook **2.2.2**. A disposable Git checkout contained the
current owned files but no dependencies, generated WXT artifacts, production
output, or task cache. It reused the local package store, not `node_modules`.

| Boundary | Actual result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed; WXT preparation ran; dependency installation did not activate Git hooks |
| `pnpm hooks:install` | Installed the pre-commit hook explicitly |
| No staged files / only Markdown staged | Hook succeeded without running Biome |
| Misformatted nested source with a space in its filename | `format:check`, hook, and `verify` all exited 1; no source/index mutation |
| `pnpm format` using `biome check --write --linter-enabled=false` | Fixed formatting; did not stage files; hook passed after explicitly staging the fix |
| Formatted source containing `debugger` | Formatting passed; `lint`, hook, and `verify` all exited 1 |
| Partially staged source plus unrelated unstaged documentation | Hook failure left tracked working-copy hashes and the index tree unchanged |
| Invalid TypeScript in excluded generated/dependency/cache/scratch paths | Root formatting and lint passed; force-staged generated output did not fail the hook |
| Root `pnpm verify` after removing generated WXT/output/task-cache directories again | Passed formatting, lint, strict types, all 5 mounted-shell tests, and Chrome production build; no task cache hits |
| Working tree after full verification | Clean; no owned source/configuration was rewritten |

The exclusion probes covered `node_modules`, `.wxt`, `.output`, `.turbo`, coverage,
`dist`, `.scratch`, and machine-local `web-ext.config.ts`. The ordinary nested
source probe proved that these exclusions did not accidentally exclude application
source. No broken fixture was retained in this repository.

The full test command was the existing root `pnpm test` → Turborepo → `vitest run`,
not a hard-coded file list; the available Console Panel tests were included.
The successful production build emitted `apps/extension/.output/chrome-mv3/`
(manifest, launcher JS, and CSS; approximately 281.19 kB total).

Clean-install validation exposed legacy pnpm settings that the pinned pnpm 12
no longer uses. Engine strictness and exact saves were moved from `.npmrc` into
`pnpm-workspace.yaml`; dependency build approval was migrated to `allowBuilds`.
Only esbuild and Tailwind's native tooling are approved. Lefthook's auto-install
script is explicitly denied; its platform binary works with explicit hook setup.

## Limits

These are local command results, not a GitHub-hosted workflow run. The workflow
requires no project secrets and has not been dispatched from this environment.
Vitest's mounted-shell integration tests use jsdom and simulated extension APIs;
they do not prove Chrome permissions, injection, visual layout, or real Tab order.
No new manual Chrome smoke check is claimed for this tooling-only change. Follow
the [README checklist](../README.md#chrome-smoke-checklist) and existing
[Chrome smoke results](chrome-smoke.md) for that separate browser boundary.
