import { network } from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";

async function main() {
  const { ethers } = await network.connect();

  console.log("Deploying TradeLedger...");

  const TradeLedger = await ethers.getContractFactory("TradeLedger");

  const ledger = await TradeLedger.deploy();

  await ledger.waitForDeployment();

  const address = await ledger.getAddress();
  const deployer = await (await ethers.getSigners())[0].getAddress();
  const chainId = Number((await ethers.provider.getNetwork()).chainId);

  console.log("TradeLedger deployed to:", address);
  console.log("Chain ID:", chainId);

  mkdirSync("deployments", { recursive: true });
  const out = {
    address,
    chainId,
    deployedAt: new Date().toISOString(),
    deployer,
  };
  writeFileSync("deployments/latest.json", JSON.stringify(out, null, 2));
  console.log("Wrote deployments/latest.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
