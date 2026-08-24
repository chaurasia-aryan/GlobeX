// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ============================================================
// MOCK USDC
//
// Local-demo-only ERC-20 that stands in for real USDC so
// TradeEscrow can move a real token with real balances on the
// local Hardhat chain (31337). 6 decimals to match live USDC.
//
// mint() is intentionally open (no access control) — this is a
// demo/test token, never intended for a production network. Do
// not deploy this contract to a live chain with real value.
// ============================================================

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "mUSDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    // Open mint for demo/test seeding only.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
