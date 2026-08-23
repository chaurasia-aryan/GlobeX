# 03 — GlobeXAI Blockchain + Escrow Implementation

## Objective

Replace the broken/simulated GlobeXAI blockchain and escrow layer with the actual implementation from the colleague repository.

## Required user journey

The final application should support the applicable lifecycle:

```text
Trade selected
    ↓
Trade created
    ↓
Escrow creation request
    ↓
Actual colleague blockchain implementation
    ↓
Transaction submitted
    ↓
Transaction confirmed
    ↓
Escrow state persisted
    ↓
Frontend displays actual state
    ↓
Documents / shipment / inspection conditions
    ↓
Actual contract-enforced release path
    OR
    dispute/refund/hold path
```

Do not force unsupported stages. Use the actual contract capabilities.

## Step 1 — Build an adapter boundary

Prefer a clear backend service boundary such as:

```text
GlobeXAI backend
      ↓
Blockchain adapter/service
      ↓
Colleague implementation
      ↓
RPC / smart contract
```

Use the colleague repository's actual API/service boundary if one already exists.

Do not duplicate smart-contract logic in n8n.

## Step 2 — Escrow creation

Implement the real creation flow.

At minimum establish:

```text
trade_id
buyer
seller
asset/token
amount
network
chain_id
contract_address
transaction_hash
escrow_id if applicable
status
created_at
```

Only mark an escrow as created/funded/locked according to the actual transaction and contract state.

Never mark success before the required confirmation.

## Step 3 — Document anchoring

If the colleague repository implements document hash anchoring:

```text
Original document bytes
        ↓
SHA-256
        ↓
Blockchain transaction
        ↓
Transaction confirmation
        ↓
Persist hash + tx hash + network + contract
```

The database record must preserve the exact hash that was submitted.

Do not hash an altered representation when the intended behavior is hashing original document bytes.

## Step 4 — Release

The frontend and n8n must not manually pretend to release funds.

Use the actual colleague implementation.

Where the smart contract enforces conditions, GlobeXAI should provide the validated inputs/signals and call the documented contract/service method.

Required state behavior:

```text
Condition not satisfied → LOCKED
Active dispute → LOCKED
Blockchain failure → unchanged prior state
Successful contract release → RELEASED
```

Never update the database to `RELEASED` before blockchain evidence supports it.

## Step 5 — Disputes

If the colleague implementation supports dispute locking/arbitration:

- integrate it;
- preserve evidence;
- prevent automatic release while dispute state is active;
- display the actual state in the frontend.

Do not invent a dispute contract if none exists.

## Step 6 — Failure handling

Handle:

- insufficient balance;
- wallet rejection;
- wrong chain;
- RPC unavailable;
- transaction reverted;
- transaction pending;
- timeout;
- duplicate submission;
- contract address mismatch;
- ABI mismatch;
- missing configuration.

Return structured states.

Do not convert failure into success.

## Required tests

At minimum test:

1. escrow creation;
2. transaction confirmation;
3. transaction failure;
4. document hash anchoring;
5. release/hold behavior;
6. dispute lock if supported;
7. wrong network;
8. missing credentials/configuration;
9. frontend state synchronization;
10. n8n integration.

Create:

`reports/blockchain/blockchain_integration_verification.md`

with actual evidence.
