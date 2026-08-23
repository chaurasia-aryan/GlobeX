# 02 — Blockchain Repository Ingestion

## Mandatory first step

Before changing GlobeXAI blockchain/escrow code, ingest the colleague's repository.

Repository:

```text
BLOCKCHAIN_REPO_URL=https://github.com/MihirPetkar108/StoreOnChain
```

Repository name must be confirmed exactly. Do not guess.

If authenticated GitHub CLI is available, Claude may locate it using exact-name search.

## Phase A — Clone/read-only inspection

Create a temporary inspection location outside the GlobeXAI working tree where possible.

Do not modify the colleague repository.

Inventory:

```text
README files
package manifests
requirements
contracts/
src/
backend/
frontend/
deploy/
scripts/
test/
tests/
abi/
artifacts/
hardhat/
foundry/
forge/
wagmi/
viem/
ethers/
web3/
.env.example
Docker/configuration
```

Search for:

```text
escrow
createEscrow
release
releasePayment
refund
dispute
lock
fund
deposit
withdraw
milestone
condition
document
hash
sha256
transaction
wallet
chain
network
RPC
contract address
ABI
event
```

## Phase B — Extract the actual architecture

Create:

`reports/blockchain/blockchain_repository_audit.md`

It must contain:

| Area | Actual implementation | Source path | Integration implication |
|---|---|---|---|
| Blockchain network | | | |
| Chain ID | | | |
| RPC | | | |
| Escrow contract | | | |
| Registry/hash contract | | | |
| Contract addresses | | | |
| ABI | | | |
| Wallet flow | | | |
| Create escrow | | | |
| Fund escrow | | | |
| Release | | | |
| Refund | | | |
| Dispute/lock | | | |
| Document hash | | | |
| Events | | | |
| Backend service | | | |
| Frontend integration | | | |
| Tests | | | |

Every row must be evidence-backed.

## Phase C — Contract/API contract extraction

For every public blockchain operation document:

```text
Operation
Input
Output
Transaction lifecycle
Required wallet/signature
Required environment variables
Contract address source
ABI source
Events
Failure modes
Revert conditions
Idempotency behavior
Network/testnet/mainnet status
```

Do not infer ABI parameters.

Read the actual contract and ABI.

## Phase D — Security review

Inspect:

- private-key handling;
- wallet signing;
- server-side signing;
- RPC credentials;
- contract ownership;
- upgradeability;
- admin roles;
- access control;
- reentrancy protections;
- integer/token handling;
- replay/idempotency behavior;
- event verification;
- transaction confirmation;
- chain mismatch handling;
- frontend secret exposure.

Never copy private keys into GlobeXAI.

Never expose server secrets through Vite variables.

## Phase E — Compatibility mapping

Create:

`reports/blockchain/globex_blockchain_compatibility.md`

Map:

```text
Existing GlobeXAI concept
        ↓
Colleague implementation
        ↓
Required adapter/API
        ↓
Frontend integration
        ↓
n8n integration
        ↓
Database persistence
```

If GlobeXAI already has a database table that can represent the blockchain result, reuse it.

Do not create duplicate blockchain/escrow tables without evidence that the canonical schema cannot represent the required state.


## Verified starting point

The exact repository supplied by the user is:

`https://github.com/MihirPetkar108/StoreOnChain`

Default branch: `main`.

Initial inspection has already confirmed:

- `blockchain/contracts/TradeLedger.sol`
- Hardhat 3 + ethers-based blockchain project
- backend API on port 3000
- invoice processing/verification endpoints
- trade recording endpoint
- exporter trade/reputation endpoints

The `TradeLedger` contract records trade data and invoice hashes and computes exporter reputation metrics.

**Do not assume this contract is an escrow vault.** Search the complete repository for `escrow`, `deposit`, `release`, `refund`, `stablecoin`, `USDC`, `USDT`, `transfer`, `payable`, and token interfaces. If no actual custody/release implementation exists, report that clearly and integrate the ledger/document-integrity capability without inventing financial escrow.
