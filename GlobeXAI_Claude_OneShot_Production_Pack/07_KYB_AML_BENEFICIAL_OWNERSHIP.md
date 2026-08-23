# KYB, AML and Beneficial Ownership

## Objective

Prevent GlobeXAI from treating an unknown organization as a trusted trading counterparty.

## Scope

This layer is separate from sanctions screening.

Screen:
- organization identity;
- registration;
- jurisdiction;
- LEI where available;
- beneficial ownership where required/available;
- directors/signatories;
- sanctions;
- adverse compliance signals;
- transaction history;
- dispute history.

## GLEIF

Use GLEIF as an entity-identity/provenance source.

Do not describe an LEI record as proof that an entity is:
- a buyer;
- solvent;
- trustworthy;
- legally compliant.

## Beneficial Ownership

Where a sanctions regime or applicable KYC/AML policy requires ownership/control review, collect and evaluate ownership evidence.

Do not infer beneficial ownership from a name similarity.

## AML

The platform should support:
- identity verification;
- suspicious pattern flagging;
- transaction anomaly review;
- source-of-funds/source-of-payment evidence where applicable;
- sanctions screening;
- escalation.

The anomaly model is behavioural evidence only.
It is not proof of money laundering, fraud, tax evasion or criminal conduct.

## Counterparty Risk

Keep:
- model risk score;
- sanctions result;
- KYB status;
- ownership status;
- document verification status

as separate fields.

Do not hide a sanctions block inside a numerical risk score.

## Decision

`KYB_CLEAR`
Identity sufficiently verified.

`KYB_REVIEW`
Information incomplete/conflicting.

`KYB_BLOCKED`
Applicable legal/business prohibition.

## Audit

Store:
- organization identifier;
- sources;
- timestamps;
- screening versions;
- reviewer;
- decision;
- evidence.

## Privacy

Collect only data required for compliance.
Restrict access to sensitive identity documents.
Define retention/deletion policy.
Do not expose KYC/ownership documents publicly.
