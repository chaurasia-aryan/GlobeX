import type { Request, Response } from "express";
import * as escrow from "../services/escrow.service.js";
import { ChainError, classifyEthersError } from "../errors.js";
import { ESCROW_STATE_LABEL } from "../types/escrow.types.js";

function sendChainError(res: Response, err: unknown) {
  const chainErr = err instanceof ChainError ? err : classifyEthersError(err);
  res.status(chainErr.httpStatus).json(chainErr.toJSON());
}

function serializeEscrow(e: Awaited<ReturnType<typeof escrow.getEscrow>>) {
  return {
    tradeId: e.tradeId,
    buyer: e.buyer,
    seller: e.seller,
    token: e.token,
    amount: e.amount.toString(),
    state: e.state,
    stateLabel: ESCROW_STATE_LABEL[e.state],
    docsVerified: e.docsVerified,
    shipmentDelivered: e.shipmentDelivered,
    inspectionPassed: e.inspectionPassed,
    createdAt: e.createdAt.toString(),
    fundedAt: e.fundedAt.toString(),
    settledAt: e.settledAt.toString(),
  };
}

export async function postCreateEscrow(req: Request, res: Response) {
  try {
    const { tradeId, buyer, seller, amount } = req.body ?? {};
    const result = await escrow.createEscrow({ tradeId, buyer, seller, amount });
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    sendChainError(res, err);
  }
}

export async function postFund(req: Request, res: Response) {
  try {
    const result = await escrow.fund(req.params.tradeId);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    sendChainError(res, err);
  }
}

export async function postCondition(req: Request, res: Response) {
  try {
    const { kind, value } = req.body ?? {};
    const result = await escrow.setCondition({ tradeId: req.params.tradeId, kind, value });
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    sendChainError(res, err);
  }
}

export async function postRelease(req: Request, res: Response) {
  try {
    const result = await escrow.release(req.params.tradeId);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    sendChainError(res, err);
  }
}

export async function postDispute(req: Request, res: Response) {
  try {
    const result = await escrow.raiseDispute(req.params.tradeId);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    sendChainError(res, err);
  }
}

export async function postResolve(req: Request, res: Response) {
  try {
    const { sellerAmount, buyerAmount } = req.body ?? {};
    const result = await escrow.resolveDispute({ tradeId: req.params.tradeId, sellerAmount, buyerAmount });
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    sendChainError(res, err);
  }
}

export async function postRefund(req: Request, res: Response) {
  try {
    const result = await escrow.refund(req.params.tradeId);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    sendChainError(res, err);
  }
}

export async function getEscrowByTradeId(req: Request, res: Response) {
  try {
    const e = await escrow.getEscrow(req.params.tradeId);
    res.status(200).json({ ok: true, escrow: serializeEscrow(e) });
  } catch (err) {
    sendChainError(res, err);
  }
}
