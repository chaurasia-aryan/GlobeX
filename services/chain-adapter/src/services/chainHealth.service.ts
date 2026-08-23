import { ethers } from "ethers";
import { loadConfig, buildClients, type ChainClients } from "../config/blockchain.config.js";
import { ChainError, classifyEthersError } from "../errors.js";

export interface ChainStatusReport {
  configured: boolean;
  connected: boolean;
  chainId: number | null;
  expectedChainId: number | null;
  networkLabel: string;
  isEphemeralLocal: boolean;
  contractAddress: string | null;
  signerAddress: string | null;
  latestBlock: number | null;
  confirmationsRequired: number;
  escrowSupported: false;
  escrowStatus: "NOT_IMPLEMENTED_DEFERRED";
  error: { code: string; message: string } | null;
}

/** Full status probe used by GET /health and surfaced to the frontend as-is. */
export async function getChainStatus(): Promise<ChainStatusReport> {
  const config = loadConfig();
  const base: ChainStatusReport = {
    configured: config.configured,
    connected: false,
    chainId: null,
    expectedChainId: config.expectedChainId ?? null,
    networkLabel: config.networkLabel,
    isEphemeralLocal: config.expectedChainId === 31337,
    contractAddress: config.contractAddress ?? null,
    signerAddress: null,
    latestBlock: null,
    confirmationsRequired: config.confirmations,
    escrowSupported: false,
    escrowStatus: "NOT_IMPLEMENTED_DEFERRED",
    error: null,
  };

  if (!config.configured) {
    base.error = { code: "CHAIN_NOT_CONFIGURED", message: `Missing: ${config.missing.join(", ")}` };
    return base;
  }

  try {
    const clients = buildClients(config);
    base.signerAddress = clients.signerAddress;

    const network = await clients.provider.getNetwork();
    base.chainId = Number(network.chainId);

    const code = await clients.provider.getCode(config.contractAddress!);
    if (code === "0x") {
      base.error = { code: "CONTRACT_NOT_FOUND", message: `No contract code at ${config.contractAddress}` };
      return base;
    }

    base.latestBlock = await clients.provider.getBlockNumber();
    base.connected = true;
  } catch (err) {
    const chainErr = classifyEthersError(err);
    base.error = { code: chainErr.code, message: chainErr.message };
  }

  return base;
}

/** Verifies the connected chain matches BLOCKCHAIN_CHAIN_ID before any write. */
export async function assertExpectedChain(clients: ChainClients, expectedChainId?: number): Promise<void> {
  if (expectedChainId === undefined) return;
  const network = await clients.provider.getNetwork();
  const actual = Number(network.chainId);
  if (actual !== expectedChainId) {
    throw new ChainError(
      "WRONG_CHAIN",
      `Connected to chain ${actual}, expected ${expectedChainId}`,
      { httpStatus: 409, details: { actual, expected: expectedChainId } }
    );
  }
}

/** Verifies contract code actually exists at the configured address. */
export async function assertContractPresent(clients: ChainClients, contractAddress: string): Promise<void> {
  const code = await clients.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new ChainError("CONTRACT_NOT_FOUND", `No contract code at ${contractAddress}`, {
      httpStatus: 409,
    });
  }
}

/** Verifies the signer has enough balance to plausibly cover gas before sending. */
export async function preflightGas(clients: ChainClients): Promise<void> {
  const balance = await clients.provider.getBalance(clients.signerAddress);
  if (balance === 0n) {
    throw new ChainError(
      "INSUFFICIENT_FUNDS",
      `Signer wallet ${clients.signerAddress} has zero balance`,
      { httpStatus: 402, details: { signerAddress: clients.signerAddress } }
    );
  }
}
