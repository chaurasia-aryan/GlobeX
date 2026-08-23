# 05 — Design Taste Frontend Integration

## Objective

Use the separate **Design Taste** repository as a visual/product-design reference and improve GlobeXAI's frontend without destroying existing business functionality.

Repository:

```text
DESIGN_TASTE_REPO_NAME=Design Taste
DESIGN_TASTE_REPO_URL=<PASTE_DESIGN_TASTE_REPOSITORY_URL>
```

Claude must locate the exact repository or use the supplied URL.

Do not guess.

If it is private and inaccessible, report the blocker instead of inventing its contents.

## Mandatory reading

Inspect the Design Taste repository before frontend changes.

Read/review:

- README;
- design documentation;
- theme/tokens;
- component library;
- page layouts;
- navigation;
- responsive rules;
- typography;
- spacing;
- cards;
- tables;
- forms;
- dialogs;
- loading states;
- empty states;
- error states;
- status components;
- charts;
- interaction patterns.

## Design objective

GlobeXAI should communicate one coherent journey:

```text
Discover
→ Assess
→ Verify
→ Secure
→ Ship
→ Settle
```

Do not turn the interface into a collection of unrelated:

```text
AI
Blockchain
Crypto
ML
OCR
Escrow
Trust
Compliance
Shipment
Analytics
```

feature cards.

## Apply Design Taste selectively

Preserve GlobeXAI's real domain requirements:

- Marketplace;
- Trade Analysis;
- Counterparty Matching;
- Risk;
- Compliance;
- Documents;
- Escrow;
- Shipments;
- Disputes;
- Settlement.

Adapt Design Taste patterns to these workflows.

Do not copy a page blindly if it conflicts with GlobeXAI information architecture.

## Blockchain/escrow UI

The frontend must show actual states:

```text
Not Created
Pending Signature
Transaction Pending
Confirmed
Locked
Condition Pending
Released
Disputed
Failed
Unavailable
```

Do not show:

- fake transaction hashes;
- fake blockchain confirmations;
- fake wallet addresses;
- fake escrow balances;
- random generated transaction IDs.

When demo/testnet data is used, label it clearly.

## Risk/compliance UI

Use explicit states:

- Verified;
- Review Required;
- Blocked;
- Unsupported;
- Stale;
- Source Unavailable.

Do not use:

- "100% legal";
- "risk-free";
- "guaranteed buyer";
- "guaranteed profit";
- unsupported compliance percentages.

## Existing UI rules

Preserve and apply the existing GlobeXAI UI guidance where it remains valid, including:

- keep navigation small;
- design for scanning;
- purposeful visualizations;
- use the globe where geography matters;
- keep critical risk/escrow/verification information visible;
- design loading, empty, success, warning, error, disabled and pending states.

These principles are already present in the project UI rules. fileciteturn1file3

## Required frontend work

Audit and improve:

- navigation;
- dashboard;
- marketplace;
- trade intent;
- trade analysis;
- counterparty views;
- compliance;
- document verification;
- escrow;
- shipment tracking;
- disputes;
- settlement;
- blockchain transaction details.

Prioritize real workflow clarity over decorative effects.

## Browser validation

Use Playwright for actual browser validation.

At minimum verify:

```text
Login/onboarding
→ Trade intent
→ Market analysis
→ Counterparty
→ Compliance
→ Trade creation
→ Escrow state
→ Document verification
→ Shipment
→ Settlement/dispute state
```

Do not claim E2E completion from TypeScript compilation alone.
