import { network } from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";

async function main() {
  const { ethers } = await network.connect();

  console.log("Deploying TradeLedger...");
  const TradeLedger = await ethers.getContractFactory("TradeLedger");
  const ledger = await TradeLedger.deploy();
  await ledger.waitForDeployment();
  const ledgerAddress = await ledger.getAddress();
  console.log("TradeLedger deployed to:", ledgerAddress);

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  // Demo buyer/seller wallets used by the escrow lifecycle scripts and the
  // adapter's local demo flows. Hardhat account #1/#2 are pre-funded with
  // ETH on the local instant-mining chain, so gas is never a blocker here.
  const demoBuyer = signers[1];
  const demoSeller = signers[2];

  console.log("Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const token = await MockUSDC.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("MockUSDC deployed to:", tokenAddress);

  console.log("Deploying TradeEscrow...");
  const TradeEscrow = await ethers.getContractFactory("TradeEscrow");
  // Deployer is the arbiter — matches services/chain-adapter's custodial
  // server-side signer, which calls createEscrow/setCondition/release/etc.
  const escrow = await TradeEscrow.deploy(deployer.address);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("TradeEscrow deployed to:", escrowAddress);

  // Seed the demo buyer with mUSDC and have them approve the escrow
  // contract, so the server-side custodial flow (fund() called by the
  // arbiter on the buyer's behalf) is runnable end-to-end without a
  // browser wallet. On a real network the buyer would sign approve()
  // themselves — this is a documented local-demo convenience only.
  const seedAmount = ethers.parseUnits("1000000", 6); // 1,000,000 mUSDC
  console.log(`Minting ${seedAmount} (raw units) mUSDC to demo buyer ${demoBuyer.address}...`);
  await (await token.mint(demoBuyer.address, seedAmount)).wait();

  console.log(`Approving TradeEscrow (${escrowAddress}) to spend demo buyer's mUSDC...`);
  await (await token.connect(demoBuyer).approve(escrowAddress, ethers.MaxUint256)).wait();

  const chainId = Number((await ethers.provider.getNetwork()).chainId);

  mkdirSync("deployments", { recursive: true });
  const out = {
    tradeLedgerAddress: ledgerAddress,
    tradeEscrowAddress: escrowAddress,
    mockUsdcAddress: tokenAddress,
    chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    arbiter: deployer.address,
    demoBuyer: demoBuyer.address,
    demoSeller: demoSeller.address,
  };
  writeFileSync("deployments/latest.json", JSON.stringify(out, null, 2));
  console.log("Wrote deployments/latest.json");
  console.log(out);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
