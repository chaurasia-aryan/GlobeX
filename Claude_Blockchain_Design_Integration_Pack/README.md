# GlobeXAI — Blockchain + Design Integration Recovery Pack

## Purpose

This pack is a **follow-on implementation pack** for the existing:

`Claude One Shot Production Pack/`

It does not replace the previous pack. It changes the execution plan for the parts that must now be rebuilt or reconciled.

### Critical change

The previous GlobeXAI implementation treated blockchain/escrow as simulated or incomplete. The authoritative blockchain/escrow implementation now exists in a **separate colleague-owned GitHub repository**.

Claude Code MUST use that repository as the primary technical reference for:

- smart contracts;
- escrow lifecycle;
- contract ABIs;
- deployment/network configuration;
- wallet interaction;
- transaction handling;
- release conditions;
- document hash anchoring;
- blockchain event handling;
- backend blockchain service;
- frontend blockchain/escrow integration;
- tests.

Do not invent a replacement blockchain architecture if the colleague repository already implements the required capability.

A second repository named **Design Taste** is also an authoritative design reference for the frontend redesign/refinement.

## Repository references

Replace these values before execution if the repositories are not discoverable through authenticated GitHub CLI:

```text
BLOCKCHAIN_REPO_NAME=StoreOnChain (MihirPetkar108/StoreOnChain)
BLOCKCHAIN_REPO_URL=https://github.com/MihirPetkar108/StoreOnChain

DESIGN_TASTE_REPO_NAME=Design Taste
DESIGN_TASTE_REPO_URL=<PASTE_DESIGN_TASTE_REPOSITORY_URL>
```

Claude may use authenticated `gh` search to locate the exact repositories by name. It MUST NOT guess a repository URL.

If a required private repository is inaccessible, stop at the repository-ingestion gate and report the blocker. Do not fabricate its contents.

## Execution precedence

Use the following precedence:

1. Current GlobeXAI filesystem and actual code.
2. Colleague blockchain/escrow repository for blockchain/escrow implementation.
3. Design Taste repository for frontend/design reference.
4. Current `Claude One Shot Production Pack/` instructions, except where this pack explicitly supersedes them.
5. Older project documentation and historical workflow descriptions.

The new pack supersedes previous instructions that ask Claude to implement simulated blockchain, fake escrow, random transaction hashes, or a newly invented blockchain service.

## Required reading

Before implementation Claude MUST read:

- every Markdown file in `Claude One Shot Production Pack/`;
- every Markdown/documentation file relevant to the blockchain repository;
- contract source files;
- deployment/configuration files;
- ABI/interface artifacts;
- blockchain backend/service code;
- blockchain tests;
- frontend integration code in the blockchain repository;
- relevant files from Design Taste.

Do not start implementation after reading only a README.

## Core outcome

The final GlobeXAI application must use the colleague's actual blockchain/escrow implementation where applicable, while preserving the existing ML/compliance work and improving the frontend using Design Taste.

The final result must be tested end-to-end and documented from actual implementation evidence.


## Skills layer

After repository ingestion, use:

- `08_SKILLS_INSTALLATION_AND_POLICY.md` for the curated skill set and token-efficiency rules.
- `09_SKILLS_AWARE_MASTER_OVERRIDE.md` for mandatory activation/precedence behavior.

The skills layer intentionally avoids installing every available skill because overlapping skills can increase instruction noise and context usage. It uses a curated set plus dynamic discovery for missing technology-specific capabilities.


## Verified blockchain repository facts

The supplied colleague repository is:

`MihirPetkar108/StoreOnChain`

`https://github.com/MihirPetkar108/StoreOnChain`

Its default branch is `main`. The repository is public and is TypeScript-based. The repository description says it stores data on the Ethereum blockchain after a successful transaction between two traders. Its topics include blockchain, data-integrity, document-hashing, Ethereum, ethers.js, SHA-256 hashing, smart contracts and Web3.

The repository contains:

```text
backend/
blockchain/
frontend/
```

The blockchain project contains:

```text
contracts/TradeLedger.sol
hardhat.config.ts
ignition/
scripts/
test/
```

The contract found at `blockchain/contracts/TradeLedger.sol` is named `TradeLedger`. It records completed-trade information including exporter/importer IDs, product, quantity, trade/inspection/dispute/settlement statuses, expected/actual delivery, invoice SHA-256 hash, trust score after trade and blockchain timestamp. It exposes trade recording/retrieval and exporter reputation functions and emits `TradeRecorded`.

The repository backend exposes invoice and trade APIs, including invoice processing/verification and `POST /api/trades`, which records a trade on the blockchain.

**Important architectural correction:** the repository evidence currently establishes a blockchain trade ledger and document-integrity/reputation system. It does **not**, from the inspected files, establish a token escrow vault, stablecoin custody, or automatic financial-release smart contract. Claude MUST NOT describe `TradeLedger` as a financial escrow contract unless further repository inspection proves that capability.

Therefore the integration plan must distinguish:

1. **Blockchain trade ledger / document integrity** — directly sourced from StoreOnChain.
2. **Financial escrow / fund locking / release** — only implement from another authoritative source if such contracts actually exist, or mark as unsupported rather than inventing them.

This distinction is mandatory.

## Community skills review incorporated

The skills layer was expanded using the supplied community-skills review. It adds systematic debugging, development-branch finishing, defense-in-depth, and conditional testing/security/design/documentation skills while explicitly excluding redundant or irrelevant skills to control context/token usage. fileciteturn12file0

## New-computer continuation rule

The previous implementation through the Phase-7 checkpoint was developed on another computer. This pack therefore treats the current machine as a **takeover environment**, not a fresh project.

Claude must first reconstruct the repository state, dependencies, configuration, services, artifacts, Phase-7 evidence and exact unfinished task. Only then may it continue.

The previous Phase 0–6 and completed Phase-7 work must not be unnecessarily repeated.

## Final additions

The execution pack now also requires:

- Opus for planning, architecture, difficult debugging and final judgment.
- Sonnet for routine implementation and execution.
- A final repository-hygiene phase only after all product phases are finished.
- Evidence-based completion percentages for each project area/repository.
- Clean GitHub issue creation for legitimate unresolved work.
- Root/repository cleanup without destructive history rewriting.
- Final repository tree, diff, progress and hygiene reports.
