# Claude Execution Rules

## One-shot implementation

Claude must execute the complete project upgrade in one run.

Do not stop after analysis.

Do not wait for permission for ordinary repository changes.

Ask only if an external credential or legally necessary human decision is genuinely unavailable.

## Preserve

Never overwrite baseline notebooks.

Never delete working model artifacts before backup.

Never silently change dataset definitions.

## Evidence

Every important claim must be traceable to:
- code;
- dataset;
- model artifact;
- official source;
- test.

## Failure behavior

A failed model is a result.
A missing source is a result.
An unavailable API is a result.

Do not fabricate successful outputs.

## Definition

"Production-ready" means reproducible, testable, observable, versioned, and safely degraded.

It does not mean perfect prediction or guaranteed legality.
