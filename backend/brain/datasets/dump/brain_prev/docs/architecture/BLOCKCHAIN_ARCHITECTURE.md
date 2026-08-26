# Blockchain & Smart Contract Architecture — GLOBEX AI

GLOBEX AI utilizes an EVM-compatible testnet (Ethereum Sepolia / Arbitrum Sepolia) for tamper-evident document integrity anchoring and trustless, conditional escrow settlement.

---

## 1. Core Trust Principle
- **Blockchain Stores**: VERIFIED EVIDENCE & CONDITIONAL ESCROW LOGIC.
- **AI Interprets**: VERIFIABLE FACTS INTO DYNAMIC TRUST & RISK SCORES.
- **Key Concept**: *"Blockchain provides tamper-evident integrity for registered evidence and enforces mathematical escrow conditions; AI provides intelligent risk interpretation."*

---

## 2. Smart Contract: `GlobexEscrow.sol`

### State Variables & Condition Flags
```solidity
struct TradeEscrow {
    bytes32 tradeId;
    address buyer;
    address seller;
    address arbitrator;
    uint256 amountUSDC;
    EscrowStatus status; // AwaitingDeposit, Funded, Released, Refunded, Disputed
    bool buyerVerified;
    bool sellerVerified;
    bool documentsVerified;
    bool shipmentDispatched;
    bool shipmentDelivered;
    bool inspectionAccepted;
    bool hasActiveDispute;
    mapping(bytes32 => bool) registeredDocumentHashes;
}
```

### Core Functions
1. `fundEscrow(bytes32 _tradeId)`: Locks USDC collateral in the contract.
2. `registerDocumentHash(bytes32 _tradeId, bytes32 _docHash, string memory _docType)`: Anchors SHA-256 fingerprint on-chain.
3. `updateMilestone(bytes32 _tradeId, uint8 _milestoneId)`: Validates lifecycle transitions with oracle/authorized signatures.
4. `releasePayment(bytes32 _tradeId)`: Executes transfer of USDC directly to the seller's wallet once all conditions evaluate to `true`.
5. `arbitrateDispute(bytes32 _tradeId, uint256 _sellerPercentage, uint256 _buyerPercentage)`: Restricted to human arbitrator wallet.

---

## 3. Public Tamper-Evident Trade Ledger
All critical milestones (Trade Created, Document Hash Registered, Escrow Funded, Shipment Dispatched, Inspection Approved, Payment Released) generate verifiable transaction hashes and block confirmations recorded in the `PublicTradeLedgerTable`.

---
STATUS: IMPLEMENTED
