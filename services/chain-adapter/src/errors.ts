import { Interface } from "ethers";

// Custom-error signatures from TradeEscrow.sol plus the OpenZeppelin
// Ownable/ERC20 errors it can bubble up. Used as a decode fallback: ethers
// only populates `err.revert` when it already has interface context (e.g.
// `contract.fn.staticCall(...)`) — a normal write call that reverts during
// gas estimation throws a CALL_EXCEPTION with raw `err.data` but no `revert`
// field, so we parse that data ourselves rather than losing the reason.
const ESCROW_ERROR_IFACE = new Interface([
  "error EscrowAlreadyExists(string tradeId)",
  "error EscrowNotFound(string tradeId)",
  "error WrongState(string tradeId, uint8 expected, uint8 actual)",
  "error ConditionsNotMet(string tradeId)",
  "error NotAuthorized(address caller)",
  "error SplitMismatch(uint256 total, uint256 amount)",
  "error InvalidParties()",
  "error InvalidAmount()",
  "error OwnableUnauthorizedAccount(address account)",
  "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)",
  "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
]);

export type ChainErrorCode =
  | "CHAIN_NOT_CONFIGURED"
  | "RPC_UNAVAILABLE"
  | "WRONG_CHAIN"
  | "CONTRACT_NOT_FOUND"
  | "CONTRACT_ADDRESS_MISMATCH"
  | "ABI_MISMATCH"
  | "INSUFFICIENT_FUNDS"
  | "SIGNER_UNAVAILABLE"
  | "TX_REVERTED"
  | "ALREADY_ANCHORED"
  | "TX_PENDING"
  | "TX_TIMEOUT"
  | "INVALID_INPUT"
  | "ESCROW_NOT_FOUND"
  | "ESCROW_ALREADY_EXISTS"
  | "ESCROW_WRONG_STATE"
  | "CONDITIONS_NOT_MET"
  | "DISPUTE_ACTIVE"
  | "INSUFFICIENT_TOKEN_BALANCE"
  | "INSUFFICIENT_ALLOWANCE"
  | "SPLIT_MISMATCH"
  | "NOT_AUTHORIZED"
  | "UNKNOWN";

export class ChainError extends Error {
  code: ChainErrorCode;
  retryable: boolean;
  details?: Record<string, unknown>;
  httpStatus: number;

  constructor(
    code: ChainErrorCode,
    message: string,
    opts: { retryable?: boolean; details?: Record<string, unknown>; httpStatus?: number } = {}
  ) {
    super(message);
    this.name = "ChainError";
    this.code = code;
    this.retryable = opts.retryable ?? false;
    this.details = opts.details;
    this.httpStatus = opts.httpStatus ?? 500;
  }

  toJSON() {
    return {
      ok: false as const,
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      details: this.details,
    };
  }
}

const HTTP_STATUS: Record<ChainErrorCode, number> = {
  CHAIN_NOT_CONFIGURED: 503,
  RPC_UNAVAILABLE: 503,
  WRONG_CHAIN: 409,
  CONTRACT_NOT_FOUND: 409,
  CONTRACT_ADDRESS_MISMATCH: 409,
  ABI_MISMATCH: 500,
  INSUFFICIENT_FUNDS: 402,
  SIGNER_UNAVAILABLE: 500,
  TX_REVERTED: 400,
  ALREADY_ANCHORED: 200,
  TX_PENDING: 202,
  TX_TIMEOUT: 504,
  INVALID_INPUT: 422,
  ESCROW_NOT_FOUND: 404,
  ESCROW_ALREADY_EXISTS: 200,
  ESCROW_WRONG_STATE: 409,
  CONDITIONS_NOT_MET: 409,
  DISPUTE_ACTIVE: 409,
  INSUFFICIENT_TOKEN_BALANCE: 402,
  INSUFFICIENT_ALLOWANCE: 402,
  SPLIT_MISMATCH: 422,
  NOT_AUTHORIZED: 403,
  UNKNOWN: 500,
};

// TradeEscrow.sol's State enum, mirrored here purely for readable error
// messages when decoding the WrongState(tradeId, expected, actual) custom
// error — the numeric values must stay in sync with the contract.
const ESCROW_STATE_NAMES = ["NONE", "PENDING", "FUNDED", "RELEASED", "REFUNDED", "DISPUTED", "RESOLVED"];

function escrowStateName(value: unknown): string {
  const n = Number(value);
  return ESCROW_STATE_NAMES[n] ?? `UNKNOWN(${String(value)})`;
}

/**
 * Classifies a decoded TradeEscrow.sol custom error (from ethers'
 * `err.revert.name` / `err.revert.args` when the ABI is loaded) into a
 * structured ChainError. Returns null if `err` isn't a recognized escrow
 * custom error, so the caller can fall through to classifyEthersError.
 */
export function classifyEscrowRevert(err: unknown): ChainError | null {
  const anyErr = err as any;
  let revertName: string | undefined = anyErr?.revert?.name ?? anyErr?.errorName;
  let revertArgs: any[] = anyErr?.revert?.args ?? anyErr?.errorArgs ?? [];

  const rawData: string | undefined = anyErr?.data ?? anyErr?.info?.error?.data;
  if (!revertName && typeof rawData === "string" && rawData.startsWith("0x") && rawData.length >= 10) {
    try {
      const parsed = ESCROW_ERROR_IFACE.parseError(rawData);
      if (parsed) {
        revertName = parsed.name;
        revertArgs = Array.from(parsed.args);
      }
    } catch {
      // Not one of our known custom errors — fall through to the generic classifier.
    }
  }

  if (!revertName) return null;

  switch (revertName) {
    case "EscrowAlreadyExists":
      return new ChainError("ESCROW_ALREADY_EXISTS", `Escrow already exists for trade ${revertArgs[0]}`, {
        httpStatus: HTTP_STATUS.ESCROW_ALREADY_EXISTS,
        details: { tradeId: revertArgs[0] },
      });
    case "EscrowNotFound":
      return new ChainError("ESCROW_NOT_FOUND", `No escrow found for trade ${revertArgs[0]}`, {
        httpStatus: HTTP_STATUS.ESCROW_NOT_FOUND,
        details: { tradeId: revertArgs[0] },
      });
    case "WrongState": {
      const [tradeId, expected, actual] = revertArgs;
      const message = `Escrow ${tradeId} is in state ${escrowStateName(actual)}, expected ${escrowStateName(expected)}`;
      // A WrongState revert while attempting release() with an actual state
      // of DISPUTED is specifically the dispute-lock path, not a generic
      // state error — surface it as DISPUTE_ACTIVE so callers can render
      // "locked by dispute" rather than a generic conflict.
      if (escrowStateName(actual) === "DISPUTED") {
        return new ChainError("DISPUTE_ACTIVE", message, {
          httpStatus: HTTP_STATUS.DISPUTE_ACTIVE,
          details: { tradeId, expected: escrowStateName(expected), actual: escrowStateName(actual) },
        });
      }
      return new ChainError("ESCROW_WRONG_STATE", message, {
        httpStatus: HTTP_STATUS.ESCROW_WRONG_STATE,
        details: { tradeId, expected: escrowStateName(expected), actual: escrowStateName(actual) },
      });
    }
    case "ConditionsNotMet":
      return new ChainError("CONDITIONS_NOT_MET", `Release conditions not yet satisfied for trade ${revertArgs[0]}`, {
        httpStatus: HTTP_STATUS.CONDITIONS_NOT_MET,
        details: { tradeId: revertArgs[0] },
      });
    case "NotAuthorized":
      return new ChainError("NOT_AUTHORIZED", `Caller ${revertArgs[0]} is not authorized for this action`, {
        httpStatus: HTTP_STATUS.NOT_AUTHORIZED,
        details: { caller: revertArgs[0] },
      });
    case "SplitMismatch":
      return new ChainError(
        "SPLIT_MISMATCH",
        `Dispute split ${revertArgs[0]} does not equal escrowed amount ${revertArgs[1]}`,
        { httpStatus: HTTP_STATUS.SPLIT_MISMATCH, details: { total: String(revertArgs[0]), amount: String(revertArgs[1]) } }
      );
    case "InvalidParties":
      return new ChainError("INVALID_INPUT", "Invalid buyer/seller/token addresses", { httpStatus: 422 });
    case "InvalidAmount":
      return new ChainError("INVALID_INPUT", "Escrow amount must be greater than zero", { httpStatus: 422 });
    case "OwnableUnauthorizedAccount":
      return new ChainError("NOT_AUTHORIZED", `Caller ${revertArgs[0]} is not the arbiter`, {
        httpStatus: HTTP_STATUS.NOT_AUTHORIZED,
        details: { caller: revertArgs[0] },
      });
    case "ERC20InsufficientBalance":
      return new ChainError(
        "INSUFFICIENT_TOKEN_BALANCE",
        `Insufficient mUSDC balance: has ${revertArgs[1]}, needs ${revertArgs[2]}`,
        { httpStatus: HTTP_STATUS.INSUFFICIENT_TOKEN_BALANCE, details: { account: revertArgs[0] } }
      );
    case "ERC20InsufficientAllowance":
      return new ChainError(
        "INSUFFICIENT_ALLOWANCE",
        `Insufficient mUSDC allowance: has ${revertArgs[1]}, needs ${revertArgs[2]}`,
        { httpStatus: HTTP_STATUS.INSUFFICIENT_ALLOWANCE, details: { spender: revertArgs[0] } }
      );
    default:
      return null;
  }
}

/**
 * Classifies an ethers/network error into a structured ChainError instead of
 * flattening every failure into one generic message (the bug this replaces:
 * StoreonChain's tradeLedger.service.ts caught every error and returned
 * either "Trade already exists" or "Failed to record trade", discarding the
 * real cause).
 */
export function classifyEthersError(err: unknown): ChainError {
  if (err instanceof ChainError) return err;

  const escrowClassified = classifyEscrowRevert(err);
  if (escrowClassified) return escrowClassified;

  const anyErr = err as any;
  const code = anyErr?.code as string | undefined;
  const shortMessage: string = anyErr?.shortMessage ?? anyErr?.message ?? String(err);
  const revertReason: string | undefined =
    anyErr?.reason ?? anyErr?.revert?.args?.[0] ?? undefined;

  if (revertReason?.includes("Trade already exists") || shortMessage.includes("Trade already exists")) {
    return new ChainError("ALREADY_ANCHORED", "Trade already exists on-chain", {
      httpStatus: HTTP_STATUS.ALREADY_ANCHORED,
      details: { revertReason },
    });
  }

  if (code === "CALL_EXCEPTION") {
    return new ChainError("TX_REVERTED", revertReason ?? shortMessage, {
      httpStatus: HTTP_STATUS.TX_REVERTED,
      details: { revertReason, raw: shortMessage },
    });
  }

  if (code === "INSUFFICIENT_FUNDS") {
    return new ChainError("INSUFFICIENT_FUNDS", "Signer wallet has insufficient funds for gas", {
      httpStatus: HTTP_STATUS.INSUFFICIENT_FUNDS,
      details: { raw: shortMessage },
    });
  }

  if (code === "NETWORK_ERROR" || code === "SERVER_ERROR" || code === "TIMEOUT" || /ECONNREFUSED|ETIMEDOUT|fetch failed/i.test(shortMessage)) {
    return new ChainError("RPC_UNAVAILABLE", "Blockchain RPC endpoint is unreachable", {
      retryable: true,
      httpStatus: HTTP_STATUS.RPC_UNAVAILABLE,
      details: { raw: shortMessage },
    });
  }

  if (code === "BAD_DATA" || code === "INVALID_ARGUMENT" || /could not decode result data/i.test(shortMessage)) {
    return new ChainError("ABI_MISMATCH", "Contract ABI does not match the deployed contract's interface", {
      httpStatus: HTTP_STATUS.ABI_MISMATCH,
      details: { raw: shortMessage },
    });
  }

  if (code === "ACTION_REJECTED") {
    return new ChainError(
      "SIGNER_UNAVAILABLE",
      "Signing was rejected — this adapter uses a custodial server-side wallet, so a rejection indicates a misconfigured or unavailable signing key, not an interactive user decision",
      { httpStatus: HTTP_STATUS.SIGNER_UNAVAILABLE, details: { raw: shortMessage } }
    );
  }

  if (/timeout/i.test(shortMessage) && /wait/i.test(shortMessage)) {
    return new ChainError(
      "TX_TIMEOUT",
      "Confirmation wait timed out — the transaction may still confirm later",
      { httpStatus: HTTP_STATUS.TX_TIMEOUT, retryable: true, details: { raw: shortMessage } }
    );
  }

  return new ChainError("UNKNOWN", shortMessage, {
    httpStatus: HTTP_STATUS.UNKNOWN,
    details: { raw: shortMessage, code },
  });
}
