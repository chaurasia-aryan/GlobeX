export interface Trade {
  transactionId: string;
  exporterId: string;
  importerId: string;
  product: string;
  quantity: bigint;
  tradeStatus: string;
  inspectionStatus: string;
  disputeStatus: string;
  settlementStatus: string;
  expectedDelivery: bigint;
  actualDelivery: bigint;
  invoiceHash: string;
  trustScoreAfterTrade: bigint;
  timestamp: bigint;
}

// Field is named `completedTrades` in the compiled contract ABI (verified via
// `blockchain/scripts/exportAbi.mjs` output) even though the contract's own
// internal reputation struct is described as "successful" trades in comments.
// StoreonChain's original hand-written ABI called this `successfulTrades`,
// which silently breaks named-field access once the compiled ABI is used.
export interface ExporterReputation {
  completedTrades: bigint;
  disputedTrades: bigint;
  failedTrades: bigint;
  cancelledTrades: bigint;
  onTimeDeliveryRate: bigint;
  qualityPassRate: bigint;
  disputeRate: bigint;
  currentTrustScore: bigint;
  totalTrades: bigint;
}

export interface RecordTradeInput {
  transactionId: string;
  exporterId: string;
  importerId: string;
  product: string;
  quantity: number | bigint;
  tradeStatus: string;
  inspectionStatus: string;
  disputeStatus: string;
  settlementStatus: string;
  expectedDelivery: number | bigint;
  actualDelivery: number | bigint;
  invoiceHash: string;
  trustScoreAfterTrade: number | bigint;
}
