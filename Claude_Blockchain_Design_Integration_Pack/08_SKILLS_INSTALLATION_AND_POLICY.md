# 08 — Skills Installation, Selection and Token-Efficiency Policy

## Purpose

Before continuing GlobeXAI implementation, Claude Code must install a **small, high-value set of agent skills** appropriate to this repository.

Do not blindly install hundreds of skills.

Skills are context tools. Overlapping skills increase instruction noise and can waste context. Install the curated set below, then use each skill only when its domain is active.

The current skills ecosystem supports project-scoped installation with:

```bash
npx skills add <source> --skill <name> --agent claude-code --yes
```

Use project scope for GlobeXAI unless there is a strong reason to install globally.

---

# A. REQUIRED — Token Efficiency

## 1. Caveman

Primary purpose: reduce unnecessary agent output and, where the current Caveman version supports it, reduce provider-side context/input overhead.

Preferred Claude Code installation:

```bash
claude plugin marketplace add JuliusBrussee/caveman
claude plugin install caveman@caveman
```

If the Claude plugin route is unavailable, use:

```bash
npx skills add JuliusBrussee/caveman --skill '*' --agent claude-code --yes
```

After installation, verify the skill/plugin is available.

Use normal/full Caveman mode according to the installed version.

IMPORTANT:

- Code must remain exact.
- Commands must remain exact.
- Errors must remain exact.
- Do not compress code, JSON, API payloads, contract ABIs, stack traces, or test output.
- Compress narration/progress commentary.
- Do not skip repository inspection merely to save tokens.

The Caveman project explicitly distinguishes concise agent output from deeper input/context compression in newer versions. Use the available version's supported mechanism rather than inventing flags.

---

# B. REQUIRED — Frontend / Design

## 2. Taste Skill — primary design skill

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend" --agent claude-code --yes
```

Use this for GlobeXAI frontend redesign and refinement.

The current Taste Skill default is v2 experimental. It covers design-language inference, layout variance, motion, density, design-system mapping and a redesign audit.

## 3. Anthropic Frontend Design

```bash
npx skills add https://github.com/anthropics/claude-code --skill frontend-design --agent claude-code --yes
```

Use for production-grade frontend design decisions.

Do not let it override Taste blindly. Reconcile both.

## 4. Vercel Web Design Guidelines

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines --agent claude-code --yes
```

Use for interface correctness, accessibility, spacing, interaction and web UI conventions.

## 5. Vercel Composition Patterns

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns --agent claude-code --yes
```

Use for scalable React component composition.

## 6. Extract Design System

```bash
npx skills add https://github.com/arvindrk/extract-design-system --skill extract-design-system --agent claude-code --yes
```

Use before large-scale frontend redesign so the existing GlobeXAI design system is extracted rather than discarded.

## 7. Impeccable Polish

```bash
npx skills add https://github.com/pbakaus/impeccable --skill polish --agent claude-code --yes
```

Use only for the final visual refinement pass.

## 8. Impeccable Critique

```bash
npx skills add https://github.com/pbakaus/impeccable --skill critique --agent claude-code --yes
```

Use for structured UI critique before polishing.

Do NOT install every Impeccable stylistic operator. `bolder`, `delight`, `distill`, `quieter`, etc. are optional operators and are intentionally excluded to avoid conflicting design directions.

---

# C. REQUIRED — Backend / API

## 9. Official FastAPI skill

```bash
npx skills add https://github.com/fastapi/fastapi --skill fastapi --agent claude-code --yes
```

Use whenever modifying:

- FastAPI routes;
- Pydantic schemas;
- dependency injection;
- middleware;
- streaming;
- API lifecycle;
- backend configuration.

This is preferred over multiple unofficial FastAPI skills.

## 10. API Design Principles

```bash
npx skills add https://github.com/wshobson/agents --skill api-design-principles --agent claude-code --yes
```

Use when creating or changing API contracts.

Do not install several competing API-design skills.

---

# D. REQUIRED — Database

GlobeXAI uses PostgreSQL/Supabase concepts.

## 11. Supabase Postgres Best Practices

```bash
npx skills add https://github.com/supabase/agent-skills --skill supabase-postgres-best-practices --agent claude-code --yes
```

Use for:

- schema design;
- indexes;
- RLS;
- migrations;
- PostgreSQL query performance.

## 12. Supabase

```bash
npx skills add https://github.com/supabase/agent-skills --skill supabase --agent claude-code --yes
```

Use only when actual Supabase client/auth/storage/realtime/migration behavior is being modified.

Do not use it to invent a Supabase architecture when the current project does not require one.

---

# E. REQUIRED — Testing / Verification

## 13. Web App Testing

```bash
npx skills add https://github.com/anthropics/skills --skill webapp-testing --agent claude-code --yes
```

Use for browser-level application verification.

## 14. Playwright Best Practices

```bash
npx skills add https://github.com/currents-dev/playwright-best-practices-skill --skill playwright-best-practices --agent claude-code --yes
```

Use when writing or repairing Playwright tests.

## 15. Verification Before Completion

```bash
npx skills add https://github.com/obra/superpowers --skill verification-before-completion --agent claude-code --yes
```

Use as a mandatory final verification gate.

## 16. Test-Driven Development

```bash
npx skills add https://github.com/obra/superpowers --skill test-driven-development --agent claude-code --yes
```

Use when adding new behavior or fixing a bug that can be expressed as a regression test.

Do not force TDD onto exploratory repository audits.

---

# F. REQUIRED — Security

## 17. Repository Security Audit

```bash
npx skills add https://github.com/tartinerlabs/skills --skill security --agent claude-code --yes
```

Use for repository-wide security audits, especially:

- dependency vulnerabilities;
- committed secrets;
- git history exposure;
- missing secret scanning;
- stale vulnerable code.

## 18. Security Review

```bash
npx skills add https://github.com/davila7/claude-code-templates --skill security-review --agent claude-code --yes
```

Use when implementing:

- auth;
- API endpoints;
- file uploads;
- secrets;
- payment/escrow;
- third-party APIs.

Do not duplicate the same security audit repeatedly. Coordinate the two security skills:
`security` = repo-wide sweep.
`security-review` = implementation/change review.

---

# G. REQUIRED — Performance

## 19. Web Performance

```bash
npx skills add https://github.com/addyosmani/web-quality-skills --skill performance --agent claude-code --yes
```

Use for frontend performance and production-build optimization.

Measure before/after when optimization is claimed.

---

# H. DO NOT INSTALL BY DEFAULT

Do not install these merely because they exist:

- multiple FastAPI skills;
- multiple API-design skills;
- multiple React style guides;
- every UI style operator;
- mobile/React Native skills;
- Next.js skills;
- Firebase skills;
- Neon skills;
- Drizzle skills;
- Stream-specific skills;
- unrelated marketing/SEO skills;
- unrelated agent integrations.

Only install them if repository inspection proves GlobeXAI uses the corresponding technology.

---

# I. Dynamic Skill Discovery

After the required set is installed, inspect the current catalog for gaps:

```bash
npx skills find react
npx skills find fastapi
npx skills find postgres
npx skills find security
npx skills find playwright
npx skills find performance
npx skills find github
npx skills find n8n
npx skills find blockchain
npx skills find smart-contract
```

For each result:

1. check whether it applies to the actual GlobeXAI stack;
2. prefer official/vendor-authored skills;
3. prefer high-install/high-reputation skills when quality is otherwise comparable;
4. inspect the repository/SKILL.md;
5. check security/audit information when available;
6. reject duplicates and conflicting instruction sets;
7. install only if it provides a capability not already covered.

Do not install skills merely because they rank highly.

---

# J. Skill Activation Policy

Claude must NOT load every installed skill into every task.

Use the smallest relevant set:

### Frontend task

```text
taste
frontend-design
web-design-guidelines
composition-patterns
extract-design-system
critique/polish
performance
webapp-testing
```

### FastAPI task

```text
fastapi
api-design-principles
security-review
testing/verification
```

### Database task

```text
supabase-postgres-best-practices
supabase
security
verification
```

### Blockchain/escrow task

```text
security
security-review
webapp-testing
verification
```

PLUS the actual colleague blockchain repository documentation/code.

Do not assume a generic blockchain skill is authoritative over the colleague repository.

### n8n task

Use only an n8n-specific skill if catalog discovery finds a reputable, relevant one. Otherwise use the actual n8n workflow documentation and current repository workflow.

### Final production audit

```text
security
performance
webapp-testing
playwright-best-practices
verification-before-completion
```

---

# K. Evidence Log

Create:

```text
reports/tooling/skills_inventory.md
```

Record:

```text
Skill
Source
Version/commit if available
Why installed
When used
Task(s)
Security/audit status
Potential conflicts
```

Do not claim a skill was used merely because it was installed.

---

# L. Token Rule

The objective is not "more skills".

The objective is:

```text
fewer repeated explanations
+ better specialized reasoning
+ less redundant narration
+ less unnecessary context
+ stronger verification
```

If two skills provide materially identical instructions, keep the better one and remove/disable the redundant one.

Never sacrifice repository inspection, tests, security review, or evidence to save tokens.


---

# M. Additional skills evaluated from the supplied community-skills review

The supplied review tested 30+ community Claude skills and specifically highlighted several developer-oriented skills. Treat that review as a discovery source, not as proof that every listed project is safe, current, or appropriate. fileciteturn12file0

For GlobeXAI, add the following **conditionally** after inspecting the actual repository and the skill source:

## 20. Systematic Debugging — HIGH PRIORITY

Source:

```text
https://github.com/obra/superpowers
```

Use for difficult Phase-7 blockers and runtime failures.

Rule:

```text
Observe
→ reproduce
→ isolate
→ form hypothesis
→ test hypothesis
→ implement minimal fix
→ regression test
```

Do not use random patching.

This is especially important because the previous Claude session stalled during Phase 7.

## 21. Finishing a Development Branch — HIGH PRIORITY

Source:

```text
https://github.com/BehiSecc/awesome-claude-skills
```

Use near the end of the implementation cycle for:

- incomplete work detection;
- cleanup;
- final tests;
- branch readiness;
- unresolved changes.

Do not use it to prematurely declare completion.

## 22. Git Worktrees — CONDITIONAL

Source:

```text
https://github.com/BehiSecc/awesome-claude-skills
```

Use only if Claude needs isolated parallel work.

Do NOT create worktrees merely because the skill exists.

For this recovery task, prefer the current working tree unless isolation is genuinely necessary.

## 23. Property/Combinatorial Testing (Pypict) — CONDITIONAL

Source:

```text
https://github.com/BehiSecc/awesome-claude-skills
```

Use for high-dimensional trade/compliance combinations where ordinary examples are insufficient.

Potential GlobeXAI use:

```text
country
+ HS6
+ counterparty
+ sanctions
+ product controls
+ shipment
+ transaction state
+ document state
```

Do not generate hundreds of cases without a reason.

## 24. Defense-in-Depth — HIGH PRIORITY

Source:

```text
https://github.com/BehiSecc/awesome-claude-skills
```

Use during the security/final-hardening phase.

Apply layered controls rather than relying on one validation step.

## 25. ffuf Security Fuzzing — CONDITIONAL

Source:

```text
https://github.com/BehiSecc/awesome-claude-skills
```

Only activate if the environment permits safe local HTTP fuzzing.

Use against local/test endpoints, never uncontrolled third-party systems.

## 26. Skill Seekers — HIGH VALUE FOR THIS PROJECT, BUT NOT A PER-RUN SKILL

Source:

```text
https://github.com/yusufkaraaslan/Skill_Seekers
```

This is particularly useful for converting authoritative documentation into a reusable skill.

Use it to generate project-specific knowledge from:

- official FastAPI documentation;
- n8n documentation;
- relevant blockchain/Ethereum documentation;
- other framework documentation actually used by GlobeXAI.

Do not generate skills from random blogs or untrusted sources.

The generated skill must be reviewed before activation.

## 27. Design Skill — CONDITIONAL ADDITION

Source:

```text
https://github.com/Dammyjay93/claude-design-skill
```

Use only if repository inspection shows that it adds meaningful design capability beyond:

```text
Taste Skill
+
frontend-design
+
web-design-guidelines
+
Design Taste repository
```

Do not stack redundant visual-design skills.

## 28. Claude Code Best Practices — REFERENCE, NOT ALWAYS INSTALLED

Source:

```text
https://github.com/shanraisshan/claude-code-best-practice
```

Use as a reference when diagnosing Claude Code workflow issues.

Do not install it if its instructions overlap heavily with the current master prompt.

---

# N. Superpowers policy — IMPORTANT TOKEN WARNING

The supplied community review recommends Superpowers, but the review also contains a later user report claiming extremely high token usage from Superpowers. That is anecdotal, not a benchmark, but it demonstrates why GlobeXAI should not blindly activate every Superpowers workflow. fileciteturn12file0

Therefore:

### Install

Superpowers is allowed because its focused debugging/TDD/verification capabilities are useful.

### Activate selectively

Use:

```text
systematic-debugging
test-driven-development
verification-before-completion
```

when their specific task applies.

### Do NOT automatically use

```text
brainstorming
long planning workflows
execute-plan wrappers
```

for every Phase-7 continuation.

The existing GlobeXAI master prompt already contains the execution plan. Re-planning the entire project would waste tokens.

---

# O. Hooks policy

The supplied review identifies:

- `johnlindquist/claude-hooks`
- CCHooks
- `claude-code-hooks-sdk`
- Claudio
- CC Notify
- Discord/Slack notification hooks
- TypeScript quality hooks

as Claude Code hook options. fileciteturn12file0

For GlobeXAI:

## Allowed

A lightweight completion/error notification hook may be useful for long Phase-7+ runs.

## Not required

Do not install multiple hook frameworks.

Choose at most ONE hook framework if a real workflow need exists.

## Prefer

A simple notification mechanism over a large hook framework.

Do not spend implementation tokens configuring cosmetic sounds/notifications.

## Quality hooks

TypeScript quality hooks are useful only if they integrate cleanly with the existing project lint/typecheck pipeline.

Do not duplicate ESLint/TypeScript CI behavior.

---

# P. Explicit exclusions from the supplied list

Do NOT install these for GlobeXAI merely because they appeared in the review:

- Tapestry;
- YouTube/article extractors;
- Content Research Writer;
- EPUB/PDF Analyzer;
- invoice organizer;
- generic web asset generator;
- Claudio sound effects;
- Discord/Slack session notifications;
- PHP/Laravel hook SDK;
- React Native/mobile-specific skills;
- unrelated research/writing skills.

They do not materially improve the current production implementation.

---

# Q. Final curated stack

The preferred GlobeXAI skill stack is now:

### Core

```text
Caveman
Taste
frontend-design
web-design-guidelines
composition-patterns
extract-design-system
critique
polish
FastAPI
API design
Supabase/Postgres
webapp-testing
Playwright
verification-before-completion
security
security-review
performance
```

### Added from supplied review

```text
systematic-debugging
finishing-development-branch
defense-in-depth
```

### Conditional

```text
TDD
Pypict
Git worktrees
ffuf
Skill Seekers
claude-design-skill
Claude Code best-practice
one lightweight hook framework
```

### Not automatic

```text
Superpowers execute-plan
Superpowers brainstorming
large hook ecosystems
research/writing skills
notification/sound skills
duplicate design/backend/database skills
```

---

# R. Skill-security gate

Before installing any community skill:

1. Inspect its repository.
2. Read its README.
3. Read its SKILL.md/instructions.
4. Inspect install scripts if present.
5. Check what files/commands it can access.
6. Reject anything that requests unnecessary credentials.
7. Reject anything that sends project data externally without a justified purpose.
8. Prefer official/vendor repositories where available.
9. Record the decision in `reports/tooling/skills_inventory.md`.

Never install a skill just because a Reddit post recommends it.

The supplied review itself recommends reading the README and checking community sources before installation; it also includes community warnings about trust and overlap. fileciteturn12file0


---

# S. Model-routing policy for skills

Skills must respect the Opus/Sonnet routing policy.

## Opus

Use Opus when the skill is being used for:

- architecture;
- complex debugging;
- threat modeling;
- design-system decisions;
- difficult repository reconciliation;
- final judgment.

## Sonnet

Use Sonnet when the skill is being used for:

- routine implementation;
- repetitive edits;
- test execution;
- formatting;
- mechanical refactoring;
- documentation;
- ordinary frontend/backend changes.

Do not use a skill's own planning workflow to force Opus or Sonnet unnecessarily.

The model-routing policy has higher priority than a skill's preferred execution style.
