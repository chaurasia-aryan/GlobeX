import "dotenv/config";
import { ethers } from "ethers";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ChainError } from "../errors.js";

const here = dirname(fileURLToPath(import.meta.url));

// Fallback ABI used only if the compiled artifact hasn't been exported yet
// (see blockchain/scripts/exportAbi.mjs). Kept minimal and logged loudly when
// used, since a hand-written ABI is exactly what caused the
// completedTrades/successfulTrades naming-drift bug found during vendoring.
const FALLBACK_ABI = [
  "function getTrade(string transactionId) view returns (tuple(string transactionId, string exporterId, string importerId, string product, uint256 quantity, string tradeStatus, string inspectionStatus, string disputeStatus, string settlementStatus, uint256 expectedDelivery, uint256 actualDelivery, string invoiceHash, uint256 trustScoreAfterTrade, uint256 timestamp))",
  "function getExporterTradeIds(string exporterId) view returns (string[])",
  "function getExporterReputation(string exporterId) view returns (uint256 completedTrades, uint256 disputedTrades, uint256 failedTrades, uint256 cancelledTrades, uint256 onTimeDeliveryRate, uint256 qualityPassRate, uint256 disputeRate, uint256 currentTrustScore, uint256 totalTrades)",
  "function recordTrade((string transactionId,string exporterId,string importerId,string product,uint256 quantity,string tradeStatus,string inspectionStatus,string disputeStatus,string settlementStatus,uint256 expectedDelivery,uint256 actualDelivery,string invoiceHash) input,uint256 trustScoreAfterTrade)",
  "function getTradesByStatus(string status) view returns (tuple(string transactionId, string exporterId, string importerId, string product, uint256 quantity, string tradeStatus, string inspectionStatus, string disputeStatus, string settlementStatus, uint256 expectedDelivery, uint256 actualDelivery, string invoiceHash, uint256 trustScoreAfterTrade, uint256 timestamp)[])",
  "function getAllTradeIds() view returns (string[])",
  "event TradeRecorded(string transactionId, string exporterId, string importerId, uint256 trustScoreAfterTrade, uint256 timestamp)",
];

function loadAbi(): ethers.InterfaceAbi {
  const compiledPath = join(here, "..", "abi", "TradeLedger.abi.json");
  try {
    return JSON.parse(readFileSync(compiledPath, "utf-8"));
  } catch {
    console.warn(
      `[chain-adapter] Compiled ABI not found at ${compiledPath} — using fallback hand-written ABI. ` +
        `Run "npm run export-abi" in blockchain/ after compiling to fix this.`
    );
    return FALLBACK_ABI;
  }
}

export interface ChainConfig {
  configured: boolean;
  missing: string[];
  rpcUrl?: string;
  contractAddress?: string;
  privateKey?: string;
  expectedChainId?: number;
  confirmations: number;
  txTimeoutMs: number;
  networkLabel: string;
}

export function loadConfig(): ChainConfig {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
  const contractAddress = process.env.TRADE_LEDGER_CONTRACT_ADDRESS;
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
  const expectedChainIdRaw = process.env.BLOCKCHAIN_CHAIN_ID;
  const confirmations = Number(process.env.BLOCKCHAIN_CONFIRMATIONS ?? "1");
  const txTimeoutMs = Number(process.env.BLOCKCHAIN_TX_TIMEOUT_MS ?? "15000");
  const networkLabel = process.env.BLOCKCHAIN_NETWORK_LABEL ?? "Local Hardhat (ephemeral)";

  const missing: string[] = [];
  if (!rpcUrl) missing.push("BLOCKCHAIN_RPC_URL");
  if (!contractAddress) missing.push("TRADE_LEDGER_CONTRACT_ADDRESS");
  if (!privateKey) missing.push("BLOCKCHAIN_PRIVATE_KEY");

  const expectedChainId = expectedChainIdRaw ? Number(expectedChainIdRaw) : undefined;

  // Refuse an unsafe confirmation policy on a local instant-mining chain:
  // waiting for >1 confirmation there hangs forever since nothing mines an
  // idle block.
  if (expectedChainId === 31337 && confirmations > 1) {
    throw new Error(
      `BLOCKCHAIN_CONFIRMATIONS=${confirmations} is unsafe for chain 31337 (local Hardhat, instant mining only mines on new transactions). Use 1.`
    );
  }

  return {
    configured: missing.length === 0,
    missing,
    rpcUrl,
    contractAddress,
    privateKey,
    expectedChainId,
    confirmations,
    txTimeoutMs,
    networkLabel,
  };
}

export const TRADE_LEDGER_ABI = loadAbi();

export interface ChainClients {
  provider: ethers.JsonRpcProvider;
  readContract: ethers.Contract;
  writeContract: ethers.Contract;
  signerAddress: string;
}

/** Lazily builds provider/contract instances — never throws at import time. */
export function buildClients(config: ChainConfig): ChainClients {
  if (!config.configured || !config.rpcUrl || !config.contractAddress || !config.privateKey) {
    throw new ChainError(
      "CHAIN_NOT_CONFIGURED",
      `Missing required configuration: ${config.missing.join(", ")}`,
      { httpStatus: 503 }
    );
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const signer = new ethers.Wallet(config.privateKey, provider);
  const readContract = new ethers.Contract(config.contractAddress, TRADE_LEDGER_ABI, provider);
  const writeContract = new ethers.Contract(config.contractAddress, TRADE_LEDGER_ABI, signer);

  return { provider, readContract, writeContract, signerAddress: signer.address };
}
