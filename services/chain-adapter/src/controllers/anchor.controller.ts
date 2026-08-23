import type { Request, Response } from "express";
import * as tradeLedger from "../services/tradeLedger.service.js";
import { getChainStatus } from "../services/chainHealth.service.js";
import { ChainError, classifyEthersError } from "../errors.js";

function sendChainError(res: Response, err: unknown) {
  const chainErr = err instanceof ChainError ? err : classifyEthersError(err);
  res.status(chainErr.httpStatus).json(chainErr.toJSON());
}

export async function postAnchorTrade(req: Request, res: Response) {
  try {
    const result = await tradeLedger.recordTrade(req.body);
    res.status(result.alreadyAnchored ? 200 : 200).json({ ok: true, ...result });
  } catch (err) {
    sendChainError(res, err);
  }
}

export async function getTrade(req: Request, res: Response) {
  try {
    const trade = await tradeLedger.getTrade(req.params.transactionId);
    res.json({
      ok: true,
      trade: {
        ...trade,
        quantity: trade.quantity.toString(),
        expectedDelivery: trade.expectedDelivery.toString(),
        actualDelivery: trade.actualDelivery.toString(),
        trustScoreAfterTrade: trade.trustScoreAfterTrade.toString(),
        timestamp: trade.timestamp.toString(),
      },
    });
  } catch (err) {
    sendChainError(res, err);
  }
}

export async function getExporterReputation(req: Request, res: Response) {
  try {
    const reputation = await tradeLedger.getExporterReputation(req.params.exporterId);
    res.json({
      ok: true,
      reputation: Object.fromEntries(
        Object.entries(reputation).map(([k, v]) => [k, (v as bigint).toString()])
      ),
    });
  } catch (err) {
    sendChainError(res, err);
  }
}

export async function getHealth(_req: Request, res: Response) {
  const status = await getChainStatus();
  res.json(status);
}
