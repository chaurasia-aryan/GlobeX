import { ethers } from "ethers";
import { loadConfig, buildClients, buildEscrowClients } from "../config/blockchain.config.js";
import { ChainError, classifyEthersError } from "../errors.js";

export interface EscrowStatusReport {
  configured: boolean;
  connected: boolean;
  contractAddress: string | null;
  tokenAddress: string | null;
  tokenSymbol: string | null;
  tokenDecimals: number | null;
  arbiterAddress: string | null;
  error: { code: string; message: string } | null;
}

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
  // No longer hardcoded — reflects a live probe of the escrow contract and
  // token below. Was previously always `false` / "NOT_IMPLEMENTED_DEFERRED"
  // before TradeEscrow.sol + MockUSDC.sol existed.
  escrowSupported: boolean;
  escrow: EscrowStatusReport;
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
    escrow: {
      configured: config.escrowConfigured,
      connected: false,
      contractAddress: config.escrowContractAddress ?? null,
      tokenAddress: config.tokenContractAddress ?? null,
      tokenSymbol: null,
      tokenDecimals: null,
      arbiterAddress: null,
      error: config.escrowConfigured
        ? null
        : { code: "CHAIN_NOT_CONFIGURED", message: `Missing: ${config.escrowMissing.join(", ")}` },
    },
    error: null,
  };

  if (!config.configured) {
    base.error = { code: "CHAIN_NOT_CONFIGURED", message: `Missing: ${config.missing.join(", ")}` };
  } else {
    try {
      const clients = buildClients(config);
      base.signerAddress = clients.signerAddress;

      const network = await clients.provider.getNetwork();
      base.chainId = Number(network.chainId);

      const code = await clients.provider.getCode(config.contractAddress!);
      if (code === "0x") {
        base.error = { code: "CONTRACT_NOT_FOUND", message: `No contract code at ${config.contractAddress}` };
      } else {
        base.latestBlock = await clients.provider.getBlockNumber();
        base.connected = true;
      }
    } catch (err) {
      const chainErr = classifyEthersError(err);
      base.error = { code: chainErr.code, message: chainErr.message };
    }
  }

  // Escrow probe is independent of the trade-ledger probe above — escrow can
  // be configured/working even if, hypothetically, the ledger isn't (and
  // vice versa).
  if (config.escrowConfigured) {
    try {
      const escrowClients = buildEscrowClients(config);

      const escrowCode = await escrowClients.provider.getCode(config.escrowContractAddress!);
      const tokenCode = await escrowClients.provider.getCode(config.tokenContractAddress!);

      if (escrowCode === "0x") {
        base.escrow.error = { code: "CONTRACT_NOT_FOUND", message: `No contract code at ${config.escrowContractAddress}` };
      } else if (tokenCode === "0x") {
        base.escrow.error = { code: "CONTRACT_NOT_FOUND", message: `No contract code at ${config.tokenContractAddress}` };
      } else {
        const [symbol, decimals, arbiter] = await Promise.all([
          escrowClients.readToken.getFunction("symbol")(),
          escrowClients.readToken.getFunction("decimals")(),
          escrowClients.readEscrow.getFunction("arbiter")(),
        ]);
        base.escrow.tokenSymbol = symbol;
        base.escrow.tokenDecimals = Number(decimals);
        base.escrow.arbiterAddress = arbiter;
        base.escrow.connected = true;
        base.escrowSupported = true;
      }
    } catch (err) {
      const chainErr = classifyEthersError(err);
      base.escrow.error = { code: chainErr.code, message: chainErr.message };
    }
  }

  return base;
}

// Both helpers below only ever touch `.provider` — narrowing the parameter
// type (rather than requiring the full TradeLedger-shaped ChainClients)
// lets escrow.service.ts reuse them against EscrowChainClients too.
interface HasProvider {
  provider: ethers.JsonRpcProvider;
}

interface HasProviderAndSigner extends HasProvider {
  signerAddress: string;
}

/** Verifies the connected chain matches BLOCKCHAIN_CHAIN_ID before any write. */
export async function assertExpectedChain(clients: HasProvider, expectedChainId?: number): Promise<void> {
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
export async function assertContractPresent(clients: HasProvider, contractAddress: string): Promise<void> {
  const code = await clients.provider.getCode(contractAddress);
  if (code === "0x") {
    throw new ChainError("CONTRACT_NOT_FOUND", `No contract code at ${contractAddress}`, {
      httpStatus: 409,
    });
  }
}

/** Verifies the signer has enough balance to plausibly cover gas before sending. */
export async function preflightGas(clients: HasProviderAndSigner): Promise<void> {
  const balance = await clients.provider.getBalance(clients.signerAddress);
  if (balance === 0n) {
    throw new ChainError(
      "INSUFFICIENT_FUNDS",
      `Signer wallet ${clients.signerAddress} has zero balance`,
      { httpStatus: 402, details: { signerAddress: clients.signerAddress } }
    );
  }
}
