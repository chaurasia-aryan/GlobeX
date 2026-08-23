import { ethers } from "ethers";
import { loadConfig, buildClients } from "../config/blockchain.config.js";
import { assertExpectedChain, assertContractPresent, preflightGas } from "./chainHealth.service.js";
import { ChainError, classifyEthersError } from "../errors.js";
import type { Trade, ExporterReputation, RecordTradeInput } from "../types/trade.types.js";

function requireNonEmptyString(field: string, value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ChainError("INVALID_INPUT", `${field} is required`, { httpStatus: 422 });
  }
  return value;
}

export interface AnchorResult {
  transactionHash: string;
  blockNumber: number;
  confirmations: number;
  networkLabel: string;
  chainId: number;
  contractAddress: string;
  alreadyAnchored: boolean;
}

/**
 * Submits recordTrade and waits for the configured confirmation count.
 * Never returns success before a confirmed, verified receipt (03_BLOCKCHAIN_IMPLEMENTATION.md:78,117).
 * Every failure is classified via classifyEthersError — no flattened
 * generic-message catch (the bug this replaces from the vendored original).
 */
export async function recordTrade(input: RecordTradeInput): Promise<AnchorResult> {
  const config = loadConfig();
  const clients = buildClients(config); // throws CHAIN_NOT_CONFIGURED if unconfigured

  requireNonEmptyString("transactionId", input.transactionId);
  requireNonEmptyString("exporterId", input.exporterId);
  requireNonEmptyString("importerId", input.importerId);
  requireNonEmptyString("product", input.product);
  requireNonEmptyString("tradeStatus", input.tradeStatus);
  requireNonEmptyString("inspectionStatus", input.inspectionStatus);
  requireNonEmptyString("disputeStatus", input.disputeStatus);
  requireNonEmptyString("settlementStatus", input.settlementStatus);
  requireNonEmptyString("invoiceHash", input.invoiceHash);

  await assertExpectedChain(clients, config.expectedChainId);
  await assertContractPresent(clients, config.contractAddress!);
  await preflightGas(clients);

  try {
    const tx = await clients.writeContract.getFunction("recordTrade")(
      [
        input.transactionId,
        input.exporterId,
        input.importerId,
        input.product,
        BigInt(input.quantity),
        input.tradeStatus,
        input.inspectionStatus,
        input.disputeStatus,
        input.settlementStatus,
        BigInt(input.expectedDelivery),
        BigInt(input.actualDelivery),
        input.invoiceHash,
      ],
      BigInt(input.trustScoreAfterTrade)
    );

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
      throw new ChainError("TX_REVERTED", "Transaction reverted", {
        httpStatus: 400,
        details: { txHash: receipt.hash },
      });
    }
    if (receipt.to?.toLowerCase() !== config.contractAddress!.toLowerCase()) {
      throw new ChainError(
        "CONTRACT_ADDRESS_MISMATCH",
        `Receipt.to (${receipt.to}) does not match configured contract (${config.contractAddress})`,
        { httpStatus: 409 }
      );
    }

    const network = await clients.provider.getNetwork();

    // tx.wait(config.confirmations) only resolves once that many
    // confirmations are guaranteed, so that value is authoritative here.
    // Re-querying provider.getBlockNumber() immediately afterward is NOT
    // reliable: ethers v6's JsonRpcProvider can return a briefly cached
    // "latest" height that lags the block the receipt just landed in.
    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      confirmations: config.confirmations,
      networkLabel: config.networkLabel,
      chainId: Number(network.chainId),
      contractAddress: config.contractAddress!,
      alreadyAnchored: false,
    };
  } catch (err) {
    const chainErr = classifyEthersError(err);

    // Duplicate submission is idempotent success, not an error: return the
    // existing on-chain record rather than propagating a 4xx/5xx.
    if (chainErr.code === "ALREADY_ANCHORED") {
      const existing = await getTrade(input.transactionId, clients.readContract);
      const network = await clients.provider.getNetwork();
      return {
        transactionHash: "", // not retrievable from a getter-only re-read; caller should use the stored blockchain_records row
        blockNumber: 0,
        confirmations: config.confirmations,
        networkLabel: config.networkLabel,
        chainId: Number(network.chainId),
        contractAddress: config.contractAddress!,
        alreadyAnchored: true,
      };
    }

    if (/timeout/i.test(chainErr.message) && chainErr.code !== "TX_TIMEOUT") {
      throw new ChainError("TX_TIMEOUT", chainErr.message, { httpStatus: 504, retryable: true });
    }

    throw chainErr;
  }
}

export async function getTrade(transactionId: string, contract?: ethers.Contract): Promise<Trade> {
  const clients = contract ? { readContract: contract } : buildClients(loadConfig());
  try {
    const trade = await clients.readContract.getFunction("getTrade")(transactionId);
    return {
      transactionId: trade.transactionId,
      exporterId: trade.exporterId,
      importerId: trade.importerId,
      product: trade.product,
      quantity: BigInt(trade.quantity.toString()),
      tradeStatus: trade.tradeStatus,
      inspectionStatus: trade.inspectionStatus,
      disputeStatus: trade.disputeStatus,
      settlementStatus: trade.settlementStatus,
      expectedDelivery: BigInt(trade.expectedDelivery.toString()),
      actualDelivery: BigInt(trade.actualDelivery.toString()),
      invoiceHash: trade.invoiceHash,
      trustScoreAfterTrade: BigInt(trade.trustScoreAfterTrade.toString()),
      timestamp: BigInt(trade.timestamp.toString()),
    };
  } catch (err) {
    throw classifyEthersError(err);
  }
}

export async function getExporterTradeIds(exporterId: string): Promise<string[]> {
  const clients = buildClients(loadConfig());
  try {
    return await clients.readContract.getFunction("getExporterTradeIds")(exporterId);
  } catch (err) {
    throw classifyEthersError(err);
  }
}

export async function getExporterReputation(exporterId: string): Promise<ExporterReputation> {
  const clients = buildClients(loadConfig());
  try {
    const reputation = await clients.readContract.getFunction("getExporterReputation")(exporterId);
    return {
      completedTrades: BigInt(reputation.completedTrades.toString()),
      disputedTrades: BigInt(reputation.disputedTrades.toString()),
      failedTrades: BigInt(reputation.failedTrades.toString()),
      cancelledTrades: BigInt(reputation.cancelledTrades.toString()),
      onTimeDeliveryRate: BigInt(reputation.onTimeDeliveryRate.toString()),
      qualityPassRate: BigInt(reputation.qualityPassRate.toString()),
      disputeRate: BigInt(reputation.disputeRate.toString()),
      currentTrustScore: BigInt(reputation.currentTrustScore.toString()),
      totalTrades: BigInt(reputation.totalTrades.toString()),
    };
  } catch (err) {
    throw classifyEthersError(err);
  }
}

export async function getAllTradeIds(): Promise<string[]> {
  const clients = buildClients(loadConfig());
  try {
    return await clients.readContract.getFunction("getAllTradeIds")();
  } catch (err) {
    throw classifyEthersError(err);
  }
}
