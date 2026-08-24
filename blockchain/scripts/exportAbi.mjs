import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "..", "services", "chain-adapter", "src", "abi");

// Every contract whose ABI the chain-adapter needs. Add new contracts here
// rather than hardcoding a single-contract path.
const CONTRACTS = ["TradeLedger", "TradeEscrow", "MockUSDC"];

mkdirSync(outDir, { recursive: true });

let exported = 0;
for (const name of CONTRACTS) {
  const artifactPath = join(here, "..", "artifacts", "contracts", `${name}.sol`, `${name}.json`);
  let artifact;
  try {
    artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));
  } catch (err) {
    console.error(
      `Could not read compiled artifact at ${artifactPath}. Run "npm run compile" first.`
    );
    console.error(err.message);
    process.exit(1);
  }

  const outPath = join(outDir, `${name}.abi.json`);
  writeFileSync(outPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`Wrote ${artifact.abi.length} ABI entries to ${outPath}`);
  exported += 1;
}

console.log(`Exported ${exported} contract ABIs.`);
