import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const artifactPath = join(
  here,
  "..",
  "artifacts",
  "contracts",
  "TradeLedger.sol",
  "TradeLedger.json"
);
const outDir = join(here, "..", "..", "services", "chain-adapter", "src", "abi");
const outPath = join(outDir, "TradeLedger.abi.json");

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

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(artifact.abi, null, 2));
console.log(`Wrote ${artifact.abi.length} ABI entries to ${outPath}`);
