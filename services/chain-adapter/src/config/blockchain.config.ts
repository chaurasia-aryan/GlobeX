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

// Minimal fallback ABIs for the escrow + token contracts, used only if
// blockchain/scripts/exportAbi.mjs hasn't been run yet after compiling.
const FALLBACK_ESCROW_ABI = [
  "function createEscrow(string tradeId,address buyer,address seller,address token,uint256 amount)",
  "function fund(string tradeId)",
  "function setCondition(string tradeId,uint8 kind,bool value)",
  "function release(string tradeId)",
  "function raiseDispute(string tradeId)",
  "function resolveDispute(string tradeId,uint256 sellerAmount,uint256 buyerAmount)",
  "function refund(string tradeId)",
  "function getEscrow(string tradeId) view returns (tuple(string tradeId,address buyer,address seller,address token,uint256 amount,uint8 state,bool docsVerified,bool shipmentDelivered,bool inspectionPassed,uint256 createdAt,uint256 fundedAt,uint256 settledAt))",
  "function arbiter() view returns (address)",
  "error EscrowAlreadyExists(string tradeId)",
  "error EscrowNotFound(string tradeId)",
  "error WrongState(string tradeId,uint8 expected,uint8 actual)",
  "error ConditionsNotMet(string tradeId)",
  "error NotAuthorized(address caller)",
  "error SplitMismatch(uint256 total,uint256 amount)",
  "error InvalidParties()",
  "error InvalidAmount()",
  "event EscrowCreated(string tradeId,address buyer,address seller,address token,uint256 amount,uint256 timestamp)",
  "event EscrowFunded(string tradeId,uint256 amount,uint256 timestamp)",
  "event ConditionSet(string tradeId,uint8 kind,bool value,uint256 timestamp)",
  "event EscrowReleased(string tradeId,address seller,uint256 amount,uint256 timestamp)",
  "event DisputeRaised(string tradeId,address raisedBy,uint256 timestamp)",
  "event DisputeResolved(string tradeId,uint256 sellerAmount,uint256 buyerAmount,uint256 timestamp)",
  "event EscrowRefunded(string tradeId,address buyer,uint256 amount,uint256 timestamp)",
];

const FALLBACK_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function mint(address to, uint256 amount)",
];

function loadAbiFile(fileName: string, fallback: ethers.InterfaceAbi): ethers.InterfaceAbi {
  const compiledPath = join(here, "..", "abi", fileName);
  try {
    return JSON.parse(readFileSync(compiledPath, "utf-8"));
  } catch {
    console.warn(
      `[chain-adapter] Compiled ABI not found at ${compiledPath} — using fallback hand-written ABI. ` +
        `Run "npm run export-abi" in blockchain/ after compiling to fix this.`
    );
    return fallback;
  }
}

export interface ChainConfig {
  configured: boolean;
  missing: string[];
  rpcUrl?: string;
  contractAddress?: string;
  escrowContractAddress?: string;
  tokenContractAddress?: string;
  privateKey?: string;
  expectedChainId?: number;
  confirmations: number;
  txTimeoutMs: number;
  networkLabel: string;
  // Escrow config is validated separately from trade-ledger config so that
  // /anchor/trade keeps working even before escrow addresses are set.
  escrowConfigured: boolean;
  escrowMissing: string[];
}

export function loadConfig(): ChainConfig {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
  const contractAddress = process.env.TRADE_LEDGER_CONTRACT_ADDRESS;
  const escrowContractAddress = process.env.TRADE_ESCROW_CONTRACT_ADDRESS;
  const tokenContractAddress = process.env.MOCK_USDC_CONTRACT_ADDRESS;
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
  const expectedChainIdRaw = process.env.BLOCKCHAIN_CHAIN_ID;
  const confirmations = Number(process.env.BLOCKCHAIN_CONFIRMATIONS ?? "1");
  const txTimeoutMs = Number(process.env.BLOCKCHAIN_TX_TIMEOUT_MS ?? "15000");
  const networkLabel = process.env.BLOCKCHAIN_NETWORK_LABEL ?? "Local Hardhat (ephemeral)";

  const missing: string[] = [];
  if (!rpcUrl) missing.push("BLOCKCHAIN_RPC_URL");
  if (!contractAddress) missing.push("TRADE_LEDGER_CONTRACT_ADDRESS");
  if (!privateKey) missing.push("BLOCKCHAIN_PRIVATE_KEY");

  const escrowMissing: string[] = [];
  if (!rpcUrl) escrowMissing.push("BLOCKCHAIN_RPC_URL");
  if (!escrowContractAddress) escrowMissing.push("TRADE_ESCROW_CONTRACT_ADDRESS");
  if (!tokenContractAddress) escrowMissing.push("MOCK_USDC_CONTRACT_ADDRESS");
  if (!privateKey) escrowMissing.push("BLOCKCHAIN_PRIVATE_KEY");

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
    escrowContractAddress,
    tokenContractAddress,
    privateKey,
    expectedChainId,
    confirmations,
    txTimeoutMs,
    networkLabel,
    escrowConfigured: escrowMissing.length === 0,
    escrowMissing,
  };
}

export const TRADE_LEDGER_ABI = loadAbi();
export const TRADE_ESCROW_ABI = loadAbiFile("TradeEscrow.abi.json", FALLBACK_ESCROW_ABI);
export const MOCK_USDC_ABI = loadAbiFile("MockUSDC.abi.json", FALLBACK_TOKEN_ABI);

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

export interface EscrowChainClients {
  provider: ethers.JsonRpcProvider;
  readEscrow: ethers.Contract;
  writeEscrow: ethers.Contract;
  readToken: ethers.Contract;
  writeToken: ethers.Contract;
  signerAddress: string;
}

/** Lazily builds provider/escrow/token contract instances — never throws at import time. */
export function buildEscrowClients(config: ChainConfig): EscrowChainClients {
  if (!config.escrowConfigured || !config.rpcUrl || !config.escrowContractAddress || !config.tokenContractAddress || !config.privateKey) {
    throw new ChainError(
      "CHAIN_NOT_CONFIGURED",
      `Missing required escrow configuration: ${config.escrowMissing.join(", ")}`,
      { httpStatus: 503 }
    );
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const signer = new ethers.Wallet(config.privateKey, provider);
  const readEscrow = new ethers.Contract(config.escrowContractAddress, TRADE_ESCROW_ABI, provider);
  const writeEscrow = new ethers.Contract(config.escrowContractAddress, TRADE_ESCROW_ABI, signer);
  const readToken = new ethers.Contract(config.tokenContractAddress, MOCK_USDC_ABI, provider);
  const writeToken = new ethers.Contract(config.tokenContractAddress, MOCK_USDC_ABI, signer);

  return { provider, readEscrow, writeEscrow, readToken, writeToken, signerAddress: signer.address };
}
