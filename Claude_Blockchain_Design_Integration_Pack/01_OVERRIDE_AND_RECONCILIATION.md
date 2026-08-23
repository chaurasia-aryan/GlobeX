# 01 — Override and Reconciliation Rules

## Role

This document changes the implementation plan from the previous `Claude One Shot Production Pack`.

The task is NOT a fresh rebuild.

The task is:

```text
Existing GlobeXAI
        +
Previous Production Pack
        +
Colleague Blockchain/Escrow Repository
        +
Design Taste Repository
        ↓
Reconciled Production Implementation
```

## 1. Preserve previous work

Before modifying anything:

```bash
git status --short
git branch --show-current
```

Create a recovery log.

Do not use:

- `git reset --hard`;
- `git clean`;
- `git restore`;
- destructive cleanup;
- blanket code replacement;
- deletion of useful model artifacts;
- deletion of previous workflow references.

The completed Phase 0–6 audit work must remain available.

Read and use:

```text
reports/tooling/tooling_audit.md
reports/production/repository_audit.md
reports/production/phase2_notebook_baseline_policy.md
reports/production/phase3_data_model_audit.md
```

when present.

## 2. Previous blockchain instructions are superseded

Treat earlier blockchain/escrow instructions as **historical architecture context only**.

In particular, do not retain or create:

- `Math.random()` transaction hashes;
- fake blockchain success;
- fake escrow state transitions;
- invented smart-contract addresses;
- invented ABI calls;
- frontend-only escrow state;
- simulated release transactions presented as real;
- a new blockchain implementation when the colleague repository already provides one.

The colleague repository becomes the authoritative implementation reference.

## 3. Previous ML findings remain valid

Do not reverse the Phase 3–6 findings merely because the old documentation describes the models as production-ready.

The new implementation must preserve the audit principle:

> Never convert an invalid metric, leaked model, or broken artifact into a production claim.

Use the actual current repository state and audit reports.

## 4. n8n remains an orchestrator

n8n must not duplicate:

- blockchain business logic;
- smart-contract condition logic;
- ML scoring mathematics;
- compliance decision logic.

For blockchain it should call the actual blockchain service/API exposed by the colleague implementation, or use the actual documented integration boundary.

The smart contract must enforce financial release conditions where the colleague implementation supports this.

## 5. Frontend authority

Design Taste is a design reference, not permission to blindly overwrite the existing application.

Claude must extract:

- design system;
- spacing;
- typography;
- component patterns;
- navigation;
- cards;
- tables;
- status patterns;
- loading/error states;
- responsive behavior;
- interaction patterns.

Then apply the useful patterns to GlobeXAI while preserving actual GlobeXAI business functionality.

## 6. No false completion

Every claimed blockchain feature must have evidence:

- source file;
- contract/service implementation;
- configuration;
- API call;
- transaction or deterministic test result;
- frontend state;
- test coverage where applicable.

If a live chain cannot be used, explicitly label the test mode and do not present it as production execution.
