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
  UNKNOWN: 500,
};

/**
 * Classifies an ethers/network error into a structured ChainError instead of
 * flattening every failure into one generic message (the bug this replaces:
 * StoreonChain's tradeLedger.service.ts caught every error and returned
 * either "Trade already exists" or "Failed to record trade", discarding the
 * real cause).
 */
export function classifyEthersError(err: unknown): ChainError {
  if (err instanceof ChainError) return err;

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
