// Mirrors TradeEscrow.sol's State enum. Numeric values must stay in sync
// with the contract (see contracts/TradeEscrow.sol).
export enum EscrowState {
  NONE = 0,
  PENDING = 1,
  FUNDED = 2,
  RELEASED = 3,
  REFUNDED = 4,
  DISPUTED = 5,
  RESOLVED = 6,
}

export const ESCROW_STATE_LABEL: Record<EscrowState, string> = {
  [EscrowState.NONE]: "NONE",
  [EscrowState.PENDING]: "PENDING",
  [EscrowState.FUNDED]: "FUNDED",
  [EscrowState.RELEASED]: "RELEASED",
  [EscrowState.REFUNDED]: "REFUNDED",
  [EscrowState.DISPUTED]: "DISPUTED",
  [EscrowState.RESOLVED]: "RESOLVED",
};

// Mirrors TradeEscrow.sol's ConditionKind enum.
export enum ConditionKind {
  DOCS = 0,
  SHIPMENT = 1,
  INSPECTION = 2,
}

export interface Escrow {
  tradeId: string;
  buyer: string;
  seller: string;
  token: string;
  amount: bigint;
  state: EscrowState;
  docsVerified: boolean;
  shipmentDelivered: boolean;
  inspectionPassed: boolean;
  createdAt: bigint;
  fundedAt: bigint;
  settledAt: bigint;
}

export interface CreateEscrowInput {
  tradeId: string;
  buyer: string;
  seller: string;
  amount: number | string | bigint; // human-readable units (e.g. "550000" mUSDC); converted with 6 decimals
}

export interface SetConditionInput {
  tradeId: string;
  kind: ConditionKind;
  value: boolean;
}

export interface ResolveDisputeInput {
  tradeId: string;
  sellerAmount: number | string | bigint;
  buyerAmount: number | string | bigint;
}

export interface EscrowTxResult {
  transactionHash: string;
  blockNumber: number;
  confirmations: number;
  networkLabel: string;
  chainId: number;
  contractAddress: string;
  tokenAddress: string;
  alreadyAnchored: boolean;
}
