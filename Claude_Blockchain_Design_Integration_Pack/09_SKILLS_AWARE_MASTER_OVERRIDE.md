# 09 — Skills-Aware Master Override for GlobeXAI

## MANDATORY

This file is an execution override for:

```text
Claude One Shot Production Pack/
Claude Blockchain Design Integration Pack/
```

Claude Code MUST read those packs first.

Then execute the skills policy in:

```text
Claude Blockchain Design Integration Pack/08_SKILLS_INSTALLATION_AND_POLICY.md
```

## Required skill stack

Install and use the curated skills for:

- token efficiency: Caveman;
- frontend design: Taste Skill;
- frontend correctness: Anthropic Frontend Design + Vercel Web Design Guidelines;
- React architecture: Vercel Composition Patterns;
- existing design extraction: Extract Design System;
- visual QA: Impeccable Critique + Polish;
- backend: official FastAPI;
- API architecture: API Design Principles;
- database: Supabase/Postgres;
- testing: Web App Testing + Playwright Best Practices;
- verification: Verification Before Completion;
- security: repository security + security review;
- performance: Web Performance.

## Priority order

When skills disagree:

1. actual repository implementation and tests;
2. colleague blockchain repository for blockchain/escrow;
3. official vendor documentation/skills for the technology being used;
4. GlobeXAI project architecture;
5. previous production-pack instructions;
6. stylistic/general-purpose third-party skills.

Never allow a generic skill to override actual contract ABI, API schema, database migration, or existing tested behavior.

## Taste must actually be used

Do not merely install Taste Skill.

During frontend work:

1. read the existing GlobeXAI UI;
2. read Design Taste repository;
3. invoke Taste/design guidance;
4. establish the GlobeXAI visual language;
5. extract existing design tokens;
6. redesign only where justified;
7. implement;
8. run visual critique;
9. polish;
10. verify in Playwright.

The final frontend must demonstrate actual design-system decisions, not merely contain the installed skill.

## Caveman must actually be used

Use Caveman to minimize unnecessary narration.

Progress messages should look like:

```text
PHASE 7 DONE — 12 files / 31 tests / 0 blockers
```

Not long descriptions of every shell command.

Keep these exact:

- source code;
- JSON;
- YAML;
- SQL;
- Python tracebacks;
- test output;
- API payloads;
- blockchain addresses;
- ABIs;
- contract errors;
- migration output.

Do not compress technical evidence.

## No skill-driven overengineering

Skills are advisors.

Do not:

- rewrite the whole project because a skill prefers another architecture;
- replace Tailwind/shadcn because a design skill prefers another UI system;
- replace FastAPI because a backend skill mentions another framework;
- replace PostgreSQL/Supabase because a database skill mentions another provider;
- replace the colleague blockchain implementation;
- add libraries merely because a skill mentions them.

Every dependency change requires repository-level justification.

## Final evidence requirement

At the end, produce:

```text
reports/tooling/skills_inventory.md
reports/production/skills_aware_final_audit.md
```

The final audit must state:

```text
Installed skills
Actually activated skills
Files changed because of each skill
Tests performed
Performance measurements
Security findings
Frontend visual verification
Blockchain verification
n8n verification
Remaining blockers
```

A skill being installed is NOT evidence that the associated feature works.

A feature being implemented is NOT evidence that it is production-ready until verification passes.


## Additional Phase-7 recovery skill policy

Because the previous Claude run stalled in Phase 7, activate `systematic-debugging` whenever the continuation hits a blocker.

Do not restart the entire plan.

Use:

```text
existing checkpoint
→ reproduce exact blocker
→ inspect logs/state
→ root-cause analysis
→ minimal fix
→ regression test
→ continue from exact unfinished task
```

Use `finishing-development-branch` only near the actual end of the work.

Use `defense-in-depth` during security hardening.

Use TDD/Pypict/Git Worktrees only when the specific task benefits from them.

Do not activate Superpowers' broad planning/execution wrappers when the existing project master plan already supplies the execution sequence. This is specifically intended to prevent unnecessary context/token consumption.

## New-computer migration rule

The first active skill sequence on this computer must prioritize:

```text
systematic-debugging
verification-before-completion
security
```

for environment reconstruction and Phase-7 blocker diagnosis.

Do not activate broad planning workflows before the takeover audit is complete.

The goal is continuity, not re-planning.


## Mandatory Opus/Sonnet routing

```text
Planning / hard reasoning → OPUS
Implementation / routine execution → SONNET
Failure / difficult diagnosis → OPUS
Fix / test / execution → SONNET
Final readiness judgment → OPUS
```

Do not keep Opus active during routine implementation.

The purpose is to preserve high-quality reasoning while minimizing expensive execution tokens.
