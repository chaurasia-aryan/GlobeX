# Skills Inventory

Per `Claude_Blockchain_Design_Integration_Pack/08_SKILLS_INSTALLATION_AND_POLICY.md` §K and `09_SKILLS_AWARE_MASTER_OVERRIDE.md` final-evidence requirement.

Date: 2026-08-23. Method: real `npx skills add` invocations, real CLI security-risk output captured below — not assumed.

**Note on install location:** skills installed this session landed in two different directories — `.claude/skills/` (this session's installs) and `.agents/skills/` (an earlier session's installs, e.g. `taste-skill`, `caveman`). Both are picked up by Claude Code (`/reload-skills` confirmed "31 skills available"). Not consolidated — moving files between conventions the tool itself manages risks breaking something that already works.

## Installed this session

| Skill | Source | Why installed | Risk (Gen/Socket/Snyk) |
|---|---|---|---|
| `frontend-design` | `anthropics/claude-code` | Required — frontend correctness (§B.3 of policy) | Safe / 0 alerts / Low |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Required — UI conventions/accessibility (§B.4) | Safe / 0 alerts / Low |
| `vercel-composition-patterns` | `vercel-labs/agent-skills` | Required — React composition (§B.5) | Safe / 0 alerts / Low |
| `extract-design-system` | `arvindrk/extract-design-system` | Required — extract existing GlobeXAI tokens before redesign (§B.6) | Safe / **1 alert / Medium** — flagged, kept since it's read-mostly and the pack's specifically recommended tool; worth a second look before heavy use |
| `impeccable` | `pbakaus/impeccable` | Required — visual critique + polish (§B.7-8). **Correction to pack docs:** the pack cites separate `polish`/`critique` skill names — the actual repo ships one skill, `impeccable` | Safe / 0 alerts / Low |
| `fastapi` | `fastapi/fastapi` | Required — official backend framework skill (§C.9), preferred over unofficial duplicates | Safe / 0 alerts / Low |
| `api-design-principles` | `wshobson/agents` | Required — API contract design (§C.10) | Safe / 0 alerts / Low |
| `webapp-testing` | `anthropics/skills` | Required — browser-level verification (§E.13) | Safe / 0 alerts / Low |
| `playwright-best-practices` | `currents-dev/playwright-best-practices-skill` | Required — Playwright test quality (§E.14) | Safe / 0 alerts / Low |
| `verification-before-completion` | `obra/superpowers` | Required — mandatory final verification gate (§E.15) | Safe / 0 alerts / Low |
| `systematic-debugging` | `obra/superpowers` | Required, high priority — Phase-7 blocker diagnosis (§M.20) | Safe / 0 alerts / Low |
| `security` | `tartinerlabs/skills` | Required — repo-wide security sweep (§F.17) | Safe / 0 alerts / Low |
| `performance` | `addyosmani/web-quality-skills` | Required — frontend performance (§G.19) | Safe / 0 alerts / Low |
| `finishing-a-development-branch` | `obra/superpowers` | Required, high priority (§M.21). **Correction to pack docs:** cited source `BehiSecc/awesome-claude-skills` has **no actual SKILL.md files** (verified: `npx skills add` returned "No valid skills found"); real source found via `npx skills find` (168K installs on `obra/superpowers`, the exact name is `finishing-a-development-branch`, not `finishing-development-branch`) | Safe / 0 alerts / Low |
| `defense-in-depth-validation` | `secondsky/claude-skills` | Required, high priority — layered security controls (§M.24). **Correction to pack docs:** same `BehiSecc/awesome-claude-skills` citation problem as above; real source found via `npx skills find` | Safe / 0 alerts / Low |

## Already installed (earlier this session, before this policy pass)

| Skill | Source | Why |
|---|---|---|
| `design-taste-frontend` (+ `-v1`) | `Leonxlnx/taste-skill` | Required — Taste Skill primary design skill (§B.2) |
| `supabase-postgres-best-practices`, `supabase` | `supabase/agent-skills` | Required — database (§D.11-12) |
| `caveman` (+ sub-skills/commands) | `JuliusBrussee/caveman` | Required — token efficiency (§A.1) |

## Native (no install needed)

| Skill | Note |
|---|---|
| `security-review` | Already a built-in Claude Code skill, not a community install — satisfies §F.18 without a separate `davila7/claude-code-templates` install |

## Not installed — explicit decisions

| Item | Decision | Reason |
|---|---|---|
| `test-driven-development` (superpowers) | Not installed | Listed "Required" under §E but the pack's own §Q final curated stack places it under **Conditional** — deferred until a specific bug-fix task benefits from an explicit regression test |
| Pypict, Git Worktrees, ffuf, Skill Seekers, `claude-design-skill`, Claude Code best-practice, hook frameworks | Not installed | §Q marks all Conditional; no current task in this pass needs them |
| Superpowers `brainstorming`/`execute-plan` wrappers | Not installed | §N/§M explicitly says not to auto-activate broad planning wrappers — this project already has its own execution plan (the OneShot + Blockchain packs + `docs/tasks.md`) |
| Every other Impeccable operator (`bolder`, `delight`, `distill`, `quieter`) | Not installed | §B.8 explicitly excludes these to avoid conflicting design directions — moot anyway since the repo ships one unified `impeccable` skill |

## Activation policy (not yet exercised — recorded for the final audit)

Per §J, skills are loaded per-task-type, not all at once. As of this writing, only `caveman` (token efficiency) has been actively used in output style this session. The rest are installed and available but not yet invoked for a matching task (frontend redesign, FastAPI change, security sweep, etc.) — see `reports/production/skills_aware_final_audit.md` for the "installed vs. actually activated" distinction.
