# Blockchain <-> n8n Mapping

Maps each branch of `backend/brain/n8n/globex_blockchain_escrow_workflow.json` to the FastAPI
route it calls, the database table it writes, and the `TradeEscrow.sol` contract method that
ultimately executes. No branch talks to Postgres or the chain directly — every write goes
through `src/api/escrow_api.py` / `src/api/trades_api.py`, which own the DB connection (RLS
intact) and proxy mutating calls through `services/chain-adapter` to the contract.

## Branch A — Create + Fund Escrow

Webhook: `POST /webhook/globex-escrow-create`
Input: `{ trade_id, buyer_address, seller_address, amount_usdc? }`

| Step | FastAPI route | DB table / column | Contract method |
|---|---|---|---|
| Create | `POST /api/v1/trades/{trade_id}/escrow` | `escrow_accounts` insert (`status=PENDING`) + `blockchain_records` (`ESCROW_CREATE`) | `TradeEscrow.createEscrow(tradeId, buyer, seller, token, amount)` |
| Fund | `POST /api/v1/escrow/{trade_id}/fund` | `escrow_accounts.status=FUNDED`, `funded_at` + `blockchain_records` (`ESCROW_FUND`) | `TradeEscrow.fund(tradeId)` (pulls `transferFrom(buyer, escrow, amount)`) |

Output: `{ status: SUCCESS, trade_id, create_tx_hash, fund_tx_hash, escrow_status }` or
`{ status: FAILED, stage: CREATE_ESCROW|FUND_ESCROW, error_code, error_message, retryable }`.

## Branch B — Document Anchor

Webhook: `POST /webhook/globex-doc-anchor`
Input: `{ trade_id }`

| Step | FastAPI route | DB table | Contract method |
|---|---|---|---|
| Anchor | `POST /api/v1/trades/{trade_id}/anchor` | `blockchain_records` insert (`TRADE_ANCHOR`, `CONFIRMED` with real tx hash) | `TradeLedger` document-hash anchoring (unrelated to escrow; requires a `COMMERCIAL_INVOICE` already uploaded to `trade_documents`) |

Output: `{ status: SUCCESS, trade_id, transaction_hash, block_number, already_anchored }` or
`{ status: FAILED, stage: ANCHOR_DOCUMENT, error_code, error_message, retryable }`
(e.g. `NO_INVOICE` if no invoice document exists for the trade yet).

## Branch C — Shipment Event -> Release

Webhook: `POST /webhook/globex-shipment-event`
Input: `{ trade_id, condition_kind: DOCS|SHIPMENT|INSPECTION, value? (default true) }`

| Step | FastAPI route | DB table / column | Contract method |
|---|---|---|---|
| Set condition | `POST /api/v1/escrow/{trade_id}/conditions` | `escrow_accounts.{docs_verified\|shipment_delivered\|inspection_ok}` | `TradeEscrow.setCondition(tradeId, kind, value)` |
| Read state | `GET /api/v1/escrow/{trade_id}` | reads `escrow_accounts` row + live chain state, reports drift | `TradeEscrow.getEscrow(tradeId)` (view) |
| Release (conditional) | `POST /api/v1/escrow/{trade_id}/release` | `escrow_accounts.status=RELEASED`, `release_tx_hash`, `released_at` | `TradeEscrow.release(tradeId)` — reverts with `ConditionsNotMet` unless all three conditions are true **and** state is `FUNDED` |

**No business rules live in n8n.** The workflow's IF node only decides whether to *ask* the
contract to release, using the same three flags the contract itself already tracks. The
contract independently re-checks every condition when `release()` is actually called and will
revert if asked wrongly — the IF node is an optimization (skip an obviously-doomed call), not
the source of truth.

Output (released): `{ status: RELEASED, trade_id, release_tx_hash, set_condition_tx_hash }`
Output (locked): `{ status: LOCKED, trade_id, reason: CONDITIONS_NOT_MET, missing_conditions, state_label }`
Output (failed): `{ status: FAILED, stage: SET_CONDITION|GET_ESCROW_STATUS|RELEASE, error_code, error_message, retryable }`

## Branch D — Dispute

Webhook: `POST /webhook/globex-dispute`
Input: `{ trade_id }`

| Step | FastAPI route | DB table / column | Contract method |
|---|---|---|---|
| Raise dispute | `POST /api/v1/escrow/{trade_id}/dispute` | `escrow_accounts.status=DISPUTED`, `dispute_active=true`, `dispute_tx_hash` | `TradeEscrow.raiseDispute(tradeId)` |

This branch never connects to any release node. The dispute lock is structural in the
contract — `release()` requires `state == FUNDED`, and `DISPUTED` is a different state — not an
n8n-side rule. Resolving a dispute (`resolveDispute`, mapped to
`POST /api/v1/escrow/{trade_id}/resolve`) is a human/arbitrator action from the frontend's
Dispute Resolution Suite, not part of this webhook-driven workflow.

## Design constraints (why the workflow looks the way it does)

- **Zero n8n credentials.** All persistence goes through FastAPI, which already owns the
  Supabase connection and RLS policies — the human imports one JSON file and activates it,
  nothing else to configure.
- **`neverError: true` on every HTTP node.** A 4xx/5xx from FastAPI flows into that branch's
  classifier Code node and returns a structured `{status: "FAILED", stage, error_code,
  error_message, retryable}` instead of killing the n8n execution with an opaque error.
- **Explicit JSON bodies only** — every HTTP node sends a named-field body built from the
  branch's own `Code - Validate ...` node output. No bare `$json` passthrough.
- **No secrets anywhere in the file** — no private keys, no RPC URLs, no wallet material. The
  private key that actually signs transactions stays in `services/chain-adapter`'s process
  environment, never in n8n.
