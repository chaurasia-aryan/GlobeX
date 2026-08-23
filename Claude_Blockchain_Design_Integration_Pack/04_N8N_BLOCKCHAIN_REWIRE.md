# 04 — n8n Blockchain/Escrow Rewire

## Critical rule

The old n8n blockchain nodes are reference architecture only.

Do not retain fake or invented blockchain operations.

The final n8n workflow must call the actual blockchain integration boundary discovered in the colleague repository.

## Required branches

### A. Create Trade + Escrow

```text
Webhook
→ Validate trade
→ Create/persist trade
→ Call actual blockchain escrow service
→ Wait/confirm according to actual service contract
→ Persist blockchain evidence
→ Respond
```

Do not let n8n calculate smart-contract business rules.

### B. Document Hash

```text
Document upload
→ OCR/verification
→ SHA-256 of original bytes
→ Actual blockchain anchor service
→ Persist tx/hash/network
→ Respond
```

If the colleague repository already hashes internally, do not hash twice unless required by its documented contract.

### C. Shipment / Settlement

```text
Shipment event
→ Validate event
→ Persist event
→ Evaluate business prerequisites
→ Call actual blockchain release interface
→ Confirm result
→ Persist final state
```

The smart contract remains the source of truth for contract-enforced financial conditions.

### D. Dispute

```text
Dispute event
→ Persist dispute
→ Invoke actual blockchain lock/dispute mechanism if supported
→ Persist transaction evidence
→ Prevent release path
```

## n8n node contract

For every blockchain node document:

```text
INPUT
OUTPUT
ERROR
SIDE EFFECT
IDEMPOTENCY
```

Use explicit payloads.

Never pass unrestricted `$json` to an external blockchain service.

## Secrets

Never hard-code:

- private keys;
- seed phrases;
- RPC secrets;
- API keys;
- wallet credentials.

Use n8n credentials or server-side environment configuration.

## Database

Before changing schema:

1. inspect actual migrations;
2. map existing escrow/blockchain tables;
3. reuse canonical tables;
4. add migrations only when genuinely necessary.

Document the mapping in:

`docs/blockchain_n8n_mapping.md`

## Verification

The final workflow must be:

- valid JSON;
- importable into n8n;
- free of unresolved placeholders;
- free of secret leakage;
- aligned with actual backend endpoints;
- aligned with actual blockchain repository contracts/services;
- tested on success and failure paths.

Save the final workflow separately from the original reference workflow.
