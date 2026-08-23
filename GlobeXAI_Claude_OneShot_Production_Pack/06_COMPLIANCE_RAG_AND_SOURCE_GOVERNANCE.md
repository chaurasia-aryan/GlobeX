# Compliance RAG and Source Governance

## Objective

Build a retrieval/evidence layer for current trade regulations without allowing the LLM to invent legal rules.

## RAG Principle

RAG retrieves evidence.
Rules/decision logic determines the compliance state.

LLM output alone must never authorize a trade.

## Existing Collection

The supplied project already has an India trade-compliance RAG collection plan covering:
- SCOMET;
- trade agreements;
- CBIC customs;
- food/SPS;
- plant quarantine;
- animal quarantine;
- ICEGATE.

Preserve and extend it.

## Add Global Regulatory Coverage

Where required:
- UN sanctions;
- OFAC;
- BIS;
- EU sanctions;
- UK sanctions;
- destination customs;
- destination import controls;
- destination product regulations.

## Source Metadata

Every document:

- document_id;
- authority;
- title;
- document number;
- publication date;
- effective date;
- version;
- jurisdiction;
- category;
- source page;
- direct document URL;
- SHA-256;
- retrieval timestamp;
- superseded status.

## Supersession

A newer official document does not automatically erase an older document.

Track:
- `supersedes`;
- `superseded_by`;
- `effective_from`;
- `effective_to`.

Default retrieval must prefer current applicable material.

## Citation Requirement

Every compliance claim returned to the user must have:
- source authority;
- document/rule;
- retrieval/effective date;
- exact evidence pointer where technically possible.

## Retrieval Failure

If no authoritative evidence supports a legal claim:
`UNAVAILABLE`.

Never hallucinate.

## Conflicting Sources

If two authoritative sources conflict:
`CONFLICT` → `REVIEW`.

Do not choose silently.

## Currentness

Implement source-specific freshness and automated stale detection.

## Required Outputs

`data/compliance/rag/`
- document_manifest.csv
- source_registry.csv
- regulatory_chunks.parquet
- coverage_matrix.csv

`reports/compliance/`
- source_coverage.md
- stale_sources.csv
- conflict_report.csv
