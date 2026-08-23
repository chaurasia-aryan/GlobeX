# 06 — Claude Code Master Execution Prompt


## MANDATORY MODEL ROUTING — OPUS FOR THINKING, SONNET FOR DOING

Use the available Claude model routing intentionally to minimize token consumption without reducing correctness.

### Planning / reasoning

Use **Opus** for:

- architecture decisions;
- interpreting the previous-computer handoff;
- deciding how to resolve conflicting implementation evidence;
- difficult root-cause analysis;
- planning a complex phase;
- security threat modeling;
- blockchain architecture interpretation;
- deciding which skills should be activated;
- deciding whether a model should be retained/retired;
- final production-readiness judgment.

Opus is the reasoning/planning model.

### Execution / implementation

Immediately switch to **Sonnet** for:

- routine file edits;
- implementing an already-decided plan;
- repetitive code changes;
- migrations;
- tests;
- formatting;
- documentation updates;
- straightforward API wiring;
- frontend implementation after design decisions;
- n8n workflow edits;
- running ordinary commands;
- mechanical refactors.

Sonnet is the execution model.

### Routing rule

```text
COMPLEX DECISION
      ↓
OPUS
      ↓
short concrete implementation plan
      ↓
SONNET
      ↓
execute
      ↓
test
      ↓
if failure:
      ↓
OPUS for diagnosis
      ↓
SONNET for fix
```

Do not keep Opus active while performing routine implementation.

Do not use Sonnet to make high-impact architectural decisions merely to save tokens.

Do not repeatedly switch models for trivial individual commands. Batch related execution work into coherent Sonnet tasks.

### Token-efficiency rule

Spend expensive reasoning tokens only where they change the outcome.

Do not use Opus for narration.

Do not produce long plans when a short executable plan is sufficient.

Do not use a broad skill workflow merely because it exists.

Preserve exact technical evidence while minimizing explanatory prose.

## ROLE

Act as the lead integration engineer for the existing GlobeXAI/SIH repository.

This is a continuation and recovery execution.

Do NOT rebuild GlobeXAI from scratch.

## AUTHORITATIVE MATERIAL

Before implementation, read every `.md` file in:

```text
Claude One Shot Production Pack/
```

Then read every `.md` file in this new integration pack.

Then ingest the exact colleague blockchain repository.

Then ingest the exact Design Taste repository.

Do not begin implementation until these reference layers have been inspected.

## REPOSITORY PRECEDENCE

Use:

1. actual current GlobeXAI code;
2. colleague blockchain repository for blockchain/escrow;
3. Design Taste repository for frontend design;
4. previous Claude One Shot Production Pack;
5. historical documentation.

Where two sources conflict, document the conflict and follow the precedence above.

## PHASE 0 — NEW-COMPUTER TAKEOVER / CONTEXT RECONSTRUCTION

IMPORTANT:

The existing GlobeXAI implementation through the Phase-7 checkpoint was developed on a DIFFERENT COMPUTER.

This computer is a continuation environment.

Therefore, do NOT assume that:

- the current working tree is identical to the previous computer;
- every dependency is installed;
- environment variables exist;
- local services are configured;
- generated artifacts exist locally;
- ports are available;
- n8n is configured;
- Playwright is configured;
- the previous terminal/session state exists.

The repository itself and its committed/uncommitted evidence are the source of truth for the handoff.

Before implementing ANY feature, perform a complete takeover audit.

### A. Establish machine/environment state

Run:

```bash
git status --short
git branch --show-current
git log --oneline -20
node --version
npm --version
python --version
git --version
claude --version
gh --version
docker --version
```

Also inspect:

```text
package.json
package-lock.json / pnpm-lock.yaml / yarn.lock
requirements.txt
pyproject.toml
.env.example / .env.local.example
.gitignore
README.md
```

Do NOT print secret values.

### B. Reconstruct the previous implementation

Locate and inspect:

```text
Claude One Shot Production Pack/
Claude Blockchain Design Integration Pack/
reports/
docs/
backend/
frontend/
src/
scripts/
n8n/
workflows/
notebooks/
models/
artifacts/
```

Use the actual repository structure; do not assume all directories exist.

Read all relevant implementation/audit documentation.

In particular, locate:

```text
Phase 0 evidence
Phase 1 evidence
Phase 2 evidence
Phase 3 evidence
Phase 4–6 evidence
Phase 7 evidence
Phase 7 blocker/error/checkpoint evidence
```

Search the repository for:

```text
PHASE 7
Phase 7
checkpoint
blocker
TODO
FIXME
NOT READY
READY
incomplete
failed
pending
```

### C. Determine EXACTLY what Phase 7 completed

Create:

```text
reports/production/new_computer_takeover.md
```

It must contain:

```text
Previous development environment:
Current development environment:
Repository branch:
Current commit:
Previous known checkpoint:
Last confirmed completed phase:
Phase 7 completed work:
Phase 7 incomplete work:
Current blockers:
Missing local dependencies:
Missing environment configuration:
Missing external credentials:
Missing generated artifacts:
Services that must be started:
Files that differ from the expected handoff:
```

For every Phase-7 task, classify it as:

```text
DONE
PARTIALLY DONE
NOT STARTED
BLOCKED
UNKNOWN
```

Do NOT guess UNKNOWN items.

### D. Verify before changing

For every item marked DONE:

- locate the implementation;
- inspect the relevant files;
- run the appropriate test/check where possible;
- confirm it still works on this computer.

A task is not considered DONE merely because a previous report says it was done.

For every item marked PARTIALLY DONE:

- identify exactly what remains;
- preserve the completed portion;
- continue from the first unfinished subtask.

For BLOCKED items:

- reproduce the blocker on this computer;
- diagnose it systematically;
- determine whether the blocker was machine-specific or repository-specific.

### E. Dependency/environment reconstruction

Compare the repository's declared dependencies with the current machine.

Install only genuinely required missing dependencies.

Recreate local configuration from:

```text
.env.example
.env.local.example
project documentation
existing configuration templates
```

Never recover secrets from git history.

Never expose secrets in logs.

If a required secret/credential is unavailable, document it as a blocker rather than inventing one.

### F. Service reconstruction

Determine which services GlobeXAI actually requires:

```text
frontend
FastAPI/backend
database
n8n
blockchain service
local Ethereum/Hardhat environment if applicable
Playwright
other model services
```

Start only the services actually needed.

Verify health endpoints and ports.

Do not assume that a service working on the previous computer is running here.

### G. Browser/tool reconstruction

Verify Playwright MCP.

Run a harmless browser smoke test.

Verify the project's actual Playwright configuration before creating a second configuration.

### H. Takeover checkpoint

Do not proceed to feature implementation until:

```text
new_computer_takeover.md
```

has been written and the repository's actual state is understood.

Then print only:

```text
TAKEOVER COMPLETE
Previous checkpoint: <phase/task>
Current repository state: <summary>
Environment gaps: <count>
Phase-7 unfinished items: <count>
Blockers: <count>
Next task: <exact first unfinished task>
```

### I. Continuation rule

After the takeover:

```text
DO NOT restart Phase 0–6.
DO NOT redo completed Phase-7 work.
DO NOT create duplicate implementations.
DO NOT rebuild working services.
DO NOT discard existing artifacts.
```

Continue from:

```text
the first verified unfinished Phase-7 task
```

Then proceed sequentially through all remaining phases.

If the repository state differs from the previous computer's state, reconcile it using evidence before modifying code.

## PHASE 1 — PREVIOUS WORK RECONCILIATION

Only after the new-computer takeover is complete:

- read the previous production reports;
- preserve valid findings;
- verify their relevant implementation claims locally;
- reconcile any differences caused by the computer migration.

Do not invalidate completed audit evidence merely because this is a different machine.

Do not assume reports are correct without checking the corresponding repository evidence.

## PHASE 2 — BLOCKCHAIN REPOSITORY GATE

Locate and inspect the colleague blockchain repository.

Do not continue into blockchain implementation until:

- contracts are located;
- ABI is located;
- deployment/network information is understood;
- escrow lifecycle is understood;
- document anchoring is understood;
- backend/service boundary is understood;
- tests are located;
- frontend integration is understood.

Write:

```text
reports/blockchain/blockchain_repository_audit.md
reports/blockchain/globex_blockchain_compatibility.md
```

## PHASE 3 — DESIGN TASTE GATE

Locate and inspect `Design Taste`.

Write:

```text
reports/design/design_taste_audit.md
```

Record what will actually be reused or adapted.

## PHASE 4 — BLOCKCHAIN IMPLEMENTATION

Integrate the colleague implementation into GlobeXAI.

Do not invent a second blockchain system.

Replace simulated behavior.

Eliminate fake/random transaction identifiers.

Implement actual:

- escrow creation;
- transaction status;
- contract interaction;
- document hash anchoring where supported;
- release/hold;
- dispute behavior where supported;
- persistence;
- frontend synchronization.

## PHASE 5 — n8n REWIRE

Update n8n so that it calls actual GlobeXAI backend/blockchain interfaces.

n8n orchestrates.

n8n does not become the smart-contract engine.

Create final importable workflow JSON separately from reference JSON.

## PHASE 6 — FRONTEND

Apply Design Taste principles to GlobeXAI.

Do not rewrite functioning business logic unnecessarily.

Improve the UI where evidence shows it is needed.

Ensure blockchain and escrow states are derived from actual backend/blockchain data.

## PHASE 7 — INTEGRATION

Verify:

```text
Frontend
→ FastAPI
→ n8n where appropriate
→ ML/compliance services
→ database
→ blockchain service/contract
→ frontend state
```

No fake success paths.

## PHASE 8 — TESTING

Run:

```text
Python syntax/import tests
Model loading tests
API tests
Database/schema tests where available
n8n workflow validation
Frontend TypeScript/build
Frontend unit tests
Playwright E2E
Blockchain integration tests
Failure-mode tests
Security checks
```

Test:

- success;
- failure;
- timeout;
- unavailable dependency;
- stale data;
- transaction pending;
- transaction reverted;
- wrong network;
- dispute;
- escrow locked;
- release;
- frontend refresh/reload.

## PHASE 9 — SECURITY

Check:

- secrets;
- API keys;
- wallet credentials;
- private keys;
- RPC configuration;
- CORS;
- auth;
- authorization;
- RLS;
- SSRF;
- path traversal;
- SQL injection;
- XSS;
- prompt injection;
- log leakage;
- PII exposure.

Never expose private blockchain credentials to Vite/frontend.

## PHASE 10 — FINAL AUDIT

Build frontend.

Start backend.

Start n8n if available.

Run representative trade scenarios.

Run blockchain integration tests.

Run Playwright.

Verify final workflow JSON.

Generate:

```text
reports/production/blockchain_design_integration_final.md
```

The report must contain:

- what changed;
- files changed;
- colleague repository used;
- contract/service evidence;
- Design Taste evidence;
- n8n changes;
- frontend changes;
- database changes;
- tests run;
- actual results;
- unresolved blockers;
- external dependencies;
- security findings.

Final status must be:

```text
READY
```

or:

```text
NOT READY
```

Never fabricate metrics.

Never claim production readiness if critical blockchain, escrow, compliance, security, or test gates are unresolved.

## EXECUTION STYLE

Execute continuously.

Do not ask for confirmation for ordinary implementation decisions.

Stop only for genuine blockers such as:

- inaccessible required repository;
- missing required credential that cannot be safely substituted;
- destructive operation requiring explicit authorization;
- legally necessary human decision.

When blocked, report the exact blocker and evidence.

Use short checkpoints:

```text
PHASE X DONE — files / tests / blockers
```

Do not spend tokens narrating every shell command.


## FINAL PHASE — REPOSITORY HYGIENE, GITHUB ISSUES AND PROGRESS

This phase runs **ONLY AFTER ALL PRODUCT/IMPLEMENTATION PHASES ARE COMPLETE**.

Do not spend the final repository-cleanup phase doing feature work.

### 1. Repository cleanliness audit

Audit the entire repository for:

- generated junk;
- temporary files;
- duplicate documentation;
- duplicate workflows;
- stale reports;
- obsolete scripts;
- abandoned model artifacts;
- copied repositories;
- downloaded archives;
- screenshots accidentally committed;
- local `.env` files;
- secrets;
- debug logs;
- `__pycache__`;
- build output;
- `node_modules`;
- temporary notebooks;
- abandoned branches/worktrees;
- duplicate frontend components;
- dead API routes;
- dead n8n workflows.

Do NOT delete anything merely because it looks old.

For every candidate:

```text
KEEP
ARCHIVE
DELETE
```

Base the decision on repository evidence.

### 2. Preserve important evidence

Do not delete:

- production audit reports;
- model validation reports;
- blockchain integration evidence;
- test reports;
- security findings;
- migration history;
- relevant documentation;
- reproducibility artifacts.

Move documentation into a clean structure if necessary rather than scattering files across the root.

### 3. Root-directory policy

The repository root should contain only genuinely necessary project-level files.

Prefer:

```text
docs/
reports/
scripts/
tests/
backend/
frontend/
blockchain/
n8n/
notebooks/
models/
```

Use the actual architecture; do not create empty directories simply to match this example.

### 4. GitHub Issues

After all implementation phases are complete, inspect the GitHub repository's existing issues.

Create GitHub Issues for every **real unresolved item** that is:

- outside the current implementation scope;
- dependent on an external credential;
- dependent on a third-party service;
- requiring human/legal review;
- a documented technical debt item;
- a known non-critical improvement.

Do NOT create issues for things already fixed.

Do NOT create duplicate issues.

Do NOT create artificial issues merely to make the repository look active.

Each issue should contain:

```text
Title
Problem
Evidence
Impact
Current state
Proposed next action
Dependencies
Priority
```

Use labels only when the repository already has a sensible label strategy or when creating a small consistent set is justified.

### 5. GitHub issue creation safety

Before creating issues:

```bash
gh repo view
gh issue list
```

Check whether an equivalent issue already exists.

Do not close/delete existing issues without explicit evidence that it is appropriate.

Do not create issues containing:

- secrets;
- private keys;
- API keys;
- personal data;
- internal credentials.

### 6. Progress percentages

Create a single authoritative progress report:

```text
reports/production/project_progress.md
```

It must calculate a percentage for:

```text
Overall GlobeXAI
Phase 0
Phase 1
Phase 2
...
Phase N
Frontend
Backend
ML
Compliance
Blockchain
n8n
Testing
Security
Documentation
Repository hygiene
```

The percentage must be evidence-based.

Do NOT use arbitrary percentages such as:

```text
"Frontend = 90%"
```

without a defined denominator.

Use a reproducible formula, for example:

```text
completed weighted tasks
/
total weighted tasks
× 100
```

Document the weighting.

For each area include:

```text
Completion %
Completed
In progress
Blocked
Not started
Evidence
```

### 7. Repository-by-repository progress

If the project includes multiple repositories, create a table:

```text
Repository | Role | Completion % | Current phase | Blockers | Evidence
```

At minimum include:

- GlobeXAI repository;
- StoreOnChain repository;
- any other repository actually used in the final architecture.

Do not claim work was performed in StoreOnChain if only its contents were consumed as a reference.

### 8. Final repository tree

Generate a clean final tree in:

```text
reports/production/final_repository_structure.md
```

Explain major directories briefly.

### 9. Final Git diff

Run:

```bash
git status --short
git diff --stat
git diff --check
```

Inspect the changes.

Search for secrets.

Check that temporary files are not tracked.

### 10. Final GitHub state

If the user/repository permissions allow it:

- create the legitimate outstanding issues;
- ensure issue titles are clear;
- ensure no duplicates;
- ensure repository metadata is clean;
- prepare a concise final repository status.

Do not force-push.

Do not rewrite shared history.

Do not delete remote branches unless explicitly authorized.

### 11. Final report

Generate:

```text
reports/production/final_repository_hygiene.md
reports/production/project_progress.md
reports/production/final_repository_structure.md
```

The final readiness report must reference these files.

Only after this phase may the execution be considered complete.
