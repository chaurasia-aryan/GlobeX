# Skills Inventory — GlobeX-New

Tracked per the project's curated-minimal-install policy: only skills matching the actual stack,
official/vendor-authored preferred, risk flags recorded at install time, smallest relevant subset
activated per task.

## Cypress (added 2026-08-24, this session)

Installed via `npx skills add https://github.com/cypress-io/ai-toolkit --skill cypress-author
--skill cypress-docs`, project-level (`.claude/skills/`, universal symlink also at
`.agents/skills/`).

| Skill | Purpose | Gen | Socket | Snyk |
|---|---|---|---|---|
| `cypress-author` | Creates/updates/fixes Cypress tests | Safe | 0 alerts | Low Risk |
| `cypress-docs` | Cypress API/docs lookup | Safe | 0 alerts | **Medium Risk** |

`cypress-explain` was deliberately **not installed** — its job (explaining existing Cypress tests)
has no target yet; this repo has zero Cypress tests as of this session. Vendor-authored
(`cypress-io/ai-toolkit`), preferred over any unofficial Cypress skill.

**Risk note:** `cypress-docs` carries a Medium Snyk risk flag. Recorded per policy; not blocking,
but worth a second look before broadening its use beyond doc lookups.

**Why added:** frontend rebuild plan (`C:\Users\Aryan\.claude\plans\read-session-md-use-cypress-replicated-lamport.md`)
calls for exporter/importer journey E2E specs in Phase 7, alongside the existing Playwright
coverage (`playwright-best-practices`, `webapp-testing`, already installed — used for real-browser
verification, not authoring/maintaining test files).

**A skill being installed is not evidence it was used.** Cypress itself (`npm i -D cypress`,
`cypress.config.ts`, `cypress/e2e/`) is not yet installed in the project — that lands in Phase 7 of
the plan above, alongside the first specs these skills will help author.
