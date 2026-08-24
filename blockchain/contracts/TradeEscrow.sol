// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ============================================================
// TRADE ESCROW
//
// Custodies a real ERC-20 token (MockUSDC on the local demo
// chain) per trade. Funds only ever move on-chain, from real
// balances, guarded by contract-enforced state transitions.
//
// The contract owner acts as the arbiter -- the GlobeXAI backend
// server-side signer (see services/chain-adapter). n8n and the
// backend never move funds directly; they only ever ask this
// contract to do so, and the contract independently re-checks
// every condition before it agrees.
// ============================================================

contract TradeEscrow is Ownable, ReentrancyGuard {

    // ============================================================
    // STATE MACHINE
    // ============================================================

    enum State {
        NONE,       // no escrow created for this tradeId
        PENDING,    // created, not yet funded
        FUNDED,     // funds locked in this contract
        RELEASED,   // funds paid out to seller
        REFUNDED,   // funds returned to buyer
        DISPUTED,   // funds locked, release blocked
        RESOLVED    // dispute settled, funds split
    }

    enum ConditionKind {
        DOCS,
        SHIPMENT,
        INSPECTION
    }

    struct Escrow {
        string  tradeId;
        address buyer;
        address seller;
        address token;
        uint256 amount;
        State   state;

        // Release conditions -- all three must be true for release().
        bool docsVerified;
        bool shipmentDelivered;
        bool inspectionPassed;

        uint256 createdAt;
        uint256 fundedAt;
        uint256 settledAt;
    }

    // tradeId => Escrow
    mapping(string => Escrow) private escrows;

    // ============================================================
    // ERRORS
    // ============================================================

    error EscrowAlreadyExists(string tradeId);
    error EscrowNotFound(string tradeId);
    error WrongState(string tradeId, State expected, State actual);
    error ConditionsNotMet(string tradeId);
    error NotAuthorized(address caller);
    error SplitMismatch(uint256 total, uint256 amount);
    error InvalidParties();
    error InvalidAmount();

    // ============================================================
    // EVENTS
    // ============================================================

    event EscrowCreated(string tradeId, address buyer, address seller, address token, uint256 amount, uint256 timestamp);
    event EscrowFunded(string tradeId, uint256 amount, uint256 timestamp);
    event ConditionSet(string tradeId, ConditionKind kind, bool value, uint256 timestamp);
    event EscrowReleased(string tradeId, address seller, uint256 amount, uint256 timestamp);
    event DisputeRaised(string tradeId, address raisedBy, uint256 timestamp);
    event DisputeResolved(string tradeId, uint256 sellerAmount, uint256 buyerAmount, uint256 timestamp);
    event EscrowRefunded(string tradeId, address buyer, uint256 amount, uint256 timestamp);

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    // Deployer is the initial arbiter (contract owner).
    constructor(address initialArbiter) Ownable(initialArbiter) {}

    // ============================================================
    // INTERNAL HELPERS
    // ============================================================

    function _requireExists(string memory tradeId) internal view returns (Escrow storage e) {
        e = escrows[tradeId];
        if (e.state == State.NONE) {
            revert EscrowNotFound(tradeId);
        }
    }

    function _requireState(string memory tradeId, Escrow storage e, State expected) internal view {
        if (e.state != expected) {
            revert WrongState(tradeId, expected, e.state);
        }
    }

    // ============================================================
    // CREATE ESCROW
    // ============================================================

    function createEscrow(
        string memory tradeId,
        address buyer,
        address seller,
        address token,
        uint256 amount
    ) public onlyOwner {
        if (escrows[tradeId].state != State.NONE) {
            revert EscrowAlreadyExists(tradeId);
        }
        if (buyer == address(0) || seller == address(0) || token == address(0) || buyer == seller) {
            revert InvalidParties();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }

        escrows[tradeId] = Escrow({
            tradeId: tradeId,
            buyer: buyer,
            seller: seller,
            token: token,
            amount: amount,
            state: State.PENDING,
            docsVerified: false,
            shipmentDelivered: false,
            inspectionPassed: false,
            createdAt: block.timestamp,
            fundedAt: 0,
            settledAt: 0
        });

        emit EscrowCreated(tradeId, buyer, seller, token, amount, block.timestamp);
    }

    // ============================================================
    // FUND ESCROW
    // ============================================================

    function fund(string memory tradeId) public nonReentrant {
        Escrow storage e = _requireExists(tradeId);
        _requireState(tradeId, e, State.PENDING);

        if (msg.sender != e.buyer && msg.sender != owner()) {
            revert NotAuthorized(msg.sender);
        }

        // Effect before interaction.
        e.state = State.FUNDED;
        e.fundedAt = block.timestamp;

        bool ok = IERC20(e.token).transferFrom(e.buyer, address(this), e.amount);
        require(ok, "Token transferFrom failed");

        emit EscrowFunded(tradeId, e.amount, block.timestamp);
    }

    // ============================================================
    // SET RELEASE CONDITION
    // ============================================================

    function setCondition(string memory tradeId, ConditionKind kind, bool value) public onlyOwner {
        Escrow storage e = _requireExists(tradeId);
        _requireState(tradeId, e, State.FUNDED);

        if (kind == ConditionKind.DOCS) {
            e.docsVerified = value;
        } else if (kind == ConditionKind.SHIPMENT) {
            e.shipmentDelivered = value;
        } else {
            e.inspectionPassed = value;
        }

        emit ConditionSet(tradeId, kind, value, block.timestamp);
    }

    // ============================================================
    // RELEASE
    // ============================================================

    // Callable by anyone once every condition is independently
    // satisfied on-chain -- n8n/backend only decide when to ask;
    // this contract is the one that actually enforces the rule.
    function release(string memory tradeId) public nonReentrant {
        Escrow storage e = _requireExists(tradeId);
        _requireState(tradeId, e, State.FUNDED);

        if (!e.docsVerified || !e.shipmentDelivered || !e.inspectionPassed) {
            revert ConditionsNotMet(tradeId);
        }

        e.state = State.RELEASED;
        e.settledAt = block.timestamp;

        bool ok = IERC20(e.token).transfer(e.seller, e.amount);
        require(ok, "Token transfer failed");

        emit EscrowReleased(tradeId, e.seller, e.amount, block.timestamp);
    }

    // ============================================================
    // DISPUTE
    // ============================================================

    function raiseDispute(string memory tradeId) public {
        Escrow storage e = _requireExists(tradeId);
        _requireState(tradeId, e, State.FUNDED);

        if (msg.sender != e.buyer && msg.sender != e.seller && msg.sender != owner()) {
            revert NotAuthorized(msg.sender);
        }

        e.state = State.DISPUTED;

        emit DisputeRaised(tradeId, msg.sender, block.timestamp);
    }

    function resolveDispute(string memory tradeId, uint256 sellerAmount, uint256 buyerAmount) public onlyOwner nonReentrant {
        Escrow storage e = _requireExists(tradeId);
        _requireState(tradeId, e, State.DISPUTED);

        if (sellerAmount + buyerAmount != e.amount) {
            revert SplitMismatch(sellerAmount + buyerAmount, e.amount);
        }

        e.state = State.RESOLVED;
        e.settledAt = block.timestamp;

        if (sellerAmount > 0) {
            bool okSeller = IERC20(e.token).transfer(e.seller, sellerAmount);
            require(okSeller, "Token transfer to seller failed");
        }
        if (buyerAmount > 0) {
            bool okBuyer = IERC20(e.token).transfer(e.buyer, buyerAmount);
            require(okBuyer, "Token transfer to buyer failed");
        }

        emit DisputeResolved(tradeId, sellerAmount, buyerAmount, block.timestamp);
    }

    // ============================================================
    // REFUND
    // ============================================================

    function refund(string memory tradeId) public onlyOwner nonReentrant {
        Escrow storage e = _requireExists(tradeId);
        _requireState(tradeId, e, State.FUNDED);

        e.state = State.REFUNDED;
        e.settledAt = block.timestamp;

        bool ok = IERC20(e.token).transfer(e.buyer, e.amount);
        require(ok, "Token transfer failed");

        emit EscrowRefunded(tradeId, e.buyer, e.amount, block.timestamp);
    }

    // ============================================================
    // GET ESCROW
    // ============================================================

    function getEscrow(string memory tradeId) public view returns (Escrow memory) {
        Escrow storage e = escrows[tradeId];
        if (e.state == State.NONE) {
            revert EscrowNotFound(tradeId);
        }
        return e;
    }

    function arbiter() public view returns (address) {
        return owner();
    }
}
