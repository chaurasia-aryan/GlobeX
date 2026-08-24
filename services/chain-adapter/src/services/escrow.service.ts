import { ethers } from "ethers";
import { loadConfig, buildEscrowClients, type EscrowChainClients } from "../config/blockchain.config.js";
import { assertExpectedChain, assertContractPresent, preflightGas } from "./chainHealth.service.js";
import { ChainError, classifyEthersError } from "../errors.js";
import {
  EscrowState,
  ConditionKind,
  type Escrow,
  type CreateEscrowInput,
  type SetConditionInput,
  type ResolveDisputeInput,
  type EscrowTxResult,
} from "../types/escrow.types.js";

// MockUSDC is fixed at 6 decimals (contracts/MockUSDC.sol). Every amount
// this service accepts in human-readable units (string/number) is converted
// with this constant rather than an extra RPC round trip to decimals().
const TOKEN_DECIMALS = 6;

function toBaseUnits(value: number | string | bigint): bigint {
  if (typeof value === "bigint") return value;
  return ethers.parseUnits(String(value), TOKEN_DECIMALS);
}

function requireNonEmptyString(field: string, value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ChainError("INVALID_INPUT", `${field} is required`, { httpStatus: 422 });
  }
  return value;
}

function requireAddress(field: string, value: unknown): string {
  const str = requireNonEmptyString(field, value);
  if (!ethers.isAddress(str)) {
    throw new ChainError("INVALID_INPUT", `${field} must be a valid address`, { httpStatus: 422 });
  }
  return str;
}

function mapEscrow(raw: any): Escrow {
  return {
    tradeId: raw.tradeId,
    buyer: raw.buyer,
    seller: raw.seller,
    token: raw.token,
    amount: BigInt(raw.amount.toString()),
    state: Number(raw.state) as EscrowState,
    docsVerified: raw.docsVerified,
    shipmentDelivered: raw.shipmentDelivered,
    inspectionPassed: raw.inspectionPassed,
    createdAt: BigInt(raw.createdAt.toString()),
    fundedAt: BigInt(raw.fundedAt.toString()),
    settledAt: BigInt(raw.settledAt.toString()),
  };
}

/**
 * Shared preflight for every mutating escrow call: loads config, builds
 * clients (throws CHAIN_NOT_CONFIGURED if escrow env vars are unset),
 * verifies chain/contract/gas — same guards tradeLedger.service.ts applies
 * before recordTrade (03_BLOCKCHAIN_IMPLEMENTATION.md:78,117: never claim
 * success before the chain backs it up).
 */
async function preflight(): Promise<{ clients: EscrowChainClients; config: ReturnType<typeof loadConfig> }> {
  const config = loadConfig();
  const clients = buildEscrowClients(config);

  await assertExpectedChain(clients, config.expectedChainId);
  await assertContractPresent(clients, config.escrowContractAddress!);
  await preflightGas(clients);

  return { clients, config };
}

/**
 * Sends a write tx via the given async factory, waits for the configured
 * confirmation count (racing a timeout), and validates the receipt before
 * returning success — mirrors tradeLedger.service.ts:recordTrade exactly.
 */
async function sendEscrowTx(
  clients: EscrowChainClients,
  config: ReturnType<typeof loadConfig>,
  send: () => Promise<ethers.ContractTransactionResponse>
): Promise<EscrowTxResult> {
  const tx = await send();

  const receipt = (await Promise.race([
    tx.wait(config.confirmations),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`tx.wait timeout after ${config.txTimeoutMs}ms`)), config.txTimeoutMs)
    ),
  ])) as ethers.TransactionReceipt | null;

  if (!receipt) {
    throw new ChainError("TX_REVERTED", "Transaction was not mined (null receipt)", { httpStatus: 400 });
  }
  if (receipt.status !== 1) {
    throw new ChainError("TX_REVERTED", "Transaction reverted", { httpStatus: 400, details: { txHash: receipt.hash } });
  }
  if (receipt.to?.toLowerCase() !== config.escrowContractAddress!.toLowerCase()) {
    throw new ChainError(
      "CONTRACT_ADDRESS_MISMATCH",
      `Receipt.to (${receipt.to}) does not match configured escrow contract (${config.escrowContractAddress})`,
      { httpStatus: 409 }
    );
  }

  const network = await clients.provider.getNetwork();

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    confirmations: config.confirmations,
    networkLabel: config.networkLabel,
    chainId: Number(network.chainId),
    contractAddress: config.escrowContractAddress!,
    tokenAddress: config.tokenContractAddress!,
    alreadyAnchored: false,
  };
}

// ============================================================
// CREATE
// ============================================================

export async function createEscrow(input: CreateEscrowInput): Promise<EscrowTxResult> {
  requireNonEmptyString("tradeId", input.tradeId);
  const buyer = requireAddress("buyer", input.buyer);
  const seller = requireAddress("seller", input.seller);
  const amount = toBaseUnits(input.amount);
  if (amount <= 0n) {
    throw new ChainError("INVALID_INPUT", "amount must be greater than zero", { httpStatus: 422 });
  }

  const { clients, config } = await preflight();

  try {
    return await sendEscrowTx(clients, config, () =>
      clients.writeEscrow.getFunction("createEscrow")(input.tradeId, buyer, seller, config.tokenContractAddress!, amount)
    );
  } catch (err) {
    const chainErr = classifyEthersError(err);
    if (chainErr.code === "ESCROW_ALREADY_EXISTS") {
      const existing = await getEscrow(input.tradeId, clients);
      const network = await clients.provider.getNetwork();
      return {
        transactionHash: "",
        blockNumber: 0,
        confirmations: config.confirmations,
        networkLabel: config.networkLabel,
        chainId: Number(network.chainId),
        contractAddress: config.escrowContractAddress!,
        tokenAddress: config.tokenContractAddress!,
        alreadyAnchored: true,
      };
    }
    throw chainErr;
  }
}

// ============================================================
// FUND
// ============================================================

export async function fund(tradeId: string): Promise<EscrowTxResult> {
  requireNonEmptyString("tradeId", tradeId);
  const { clients, config } = await preflight();

  try {
    return await sendEscrowTx(clients, config, () => clients.writeEscrow.getFunction("fund")(tradeId));
  } catch (err) {
    throw classifyEthersError(err);
  }
}

// ============================================================
// SET CONDITION
// ============================================================

export async function setCondition(input: SetConditionInput): Promise<EscrowTxResult> {
  requireNonEmptyString("tradeId", input.tradeId);
  if (![ConditionKind.DOCS, ConditionKind.SHIPMENT, ConditionKind.INSPECTION].includes(input.kind)) {
    throw new ChainError("INVALID_INPUT", "kind must be DOCS, SHIPMENT, or INSPECTION", { httpStatus: 422 });
  }

  const { clients, config } = await preflight();

  try {
    return await sendEscrowTx(clients, config, () =>
      clients.writeEscrow.getFunction("setCondition")(input.tradeId, input.kind, input.value)
    );
  } catch (err) {
    throw classifyEthersError(err);
  }
}

// ============================================================
// RELEASE
// ============================================================

export async function release(tradeId: string): Promise<EscrowTxResult> {
  requireNonEmptyString("tradeId", tradeId);
  const { clients, config } = await preflight();

  try {
    return await sendEscrowTx(clients, config, () => clients.writeEscrow.getFunction("release")(tradeId));
  } catch (err) {
    // classifyEthersError already turns a WrongState(..., actual=DISPUTED)
    // revert into DISPUTE_ACTIVE, and ConditionsNotMet into CONDITIONS_NOT_MET
    // — both are "still locked", not server errors.
    throw classifyEthersError(err);
  }
}

// ============================================================
// DISPUTE
// ============================================================

export async function raiseDispute(tradeId: string): Promise<EscrowTxResult> {
  requireNonEmptyString("tradeId", tradeId);
  const { clients, config } = await preflight();

  try {
    return await sendEscrowTx(clients, config, () => clients.writeEscrow.getFunction("raiseDispute")(tradeId));
  } catch (err) {
    throw classifyEthersError(err);
  }
}

export async function resolveDispute(input: ResolveDisputeInput): Promise<EscrowTxResult> {
  requireNonEmptyString("tradeId", input.tradeId);
  const sellerAmount = toBaseUnits(input.sellerAmount);
  const buyerAmount = toBaseUnits(input.buyerAmount);

  const { clients, config } = await preflight();

  try {
    return await sendEscrowTx(clients, config, () =>
      clients.writeEscrow.getFunction("resolveDispute")(input.tradeId, sellerAmount, buyerAmount)
    );
  } catch (err) {
    throw classifyEthersError(err);
  }
}

// ============================================================
// REFUND
// ============================================================

export async function refund(tradeId: string): Promise<EscrowTxResult> {
  requireNonEmptyString("tradeId", tradeId);
  const { clients, config } = await preflight();

  try {
    return await sendEscrowTx(clients, config, () => clients.writeEscrow.getFunction("refund")(tradeId));
  } catch (err) {
    throw classifyEthersError(err);
  }
}

// ============================================================
// GET ESCROW (with live token balance for drift detection)
// ============================================================

export async function getEscrow(tradeId: string, clients?: EscrowChainClients): Promise<Escrow> {
  const resolvedClients = clients ?? buildEscrowClients(loadConfig());
  try {
    const raw = await resolvedClients.readEscrow.getFunction("getEscrow")(tradeId);
    return mapEscrow(raw);
  } catch (err) {
    throw classifyEthersError(err);
  }
}

export async function getTokenBalance(address: string): Promise<bigint> {
  const clients = buildEscrowClients(loadConfig());
  try {
    const balance = await clients.readToken.getFunction("balanceOf")(address);
    return BigInt(balance.toString());
  } catch (err) {
    throw classifyEthersError(err);
  }
}
