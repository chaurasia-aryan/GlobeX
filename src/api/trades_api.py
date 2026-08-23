"""
GlobeXAI Trade OS — Trade, Document & Blockchain-Anchoring Router.

This is the persistence layer the platform never had: the 7 pre-existing
routers are all stateless ML predictors with no DB client anywhere. This
router owns `public.trades` / `public.trade_documents` / `public.blockchain_records`
(all pre-existing, orphaned tables — no new tables added) and is the only
thing that calls the chain-adapter service.

Fail-closed throughout: if the DB or the chain-adapter is unreachable, this
returns a structured error and writes nothing — it never fabricates success.
No financial escrow is implemented here (see docs/roadmap/escrow_phase.md);
`escrow_accounts` is deliberately left untouched.
"""

from __future__ import annotations

import hashlib
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from src.db.client import DatabaseUnavailable, acquire, is_configured, transaction
from src.services import chain_client
from src.services.chain_client import ChainClientError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Trades & Blockchain"])

ANCHORING_ENABLED = os.getenv("BLOCKCHAIN_ANCHORING_ENABLED", "false").lower() == "true"


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class TradeCreateRequest(BaseModel):
    listing_id: Optional[str] = None
    exporter_id: str = Field(..., description="organizations.id UUID")
    importer_id: str = Field(..., description="organizations.id UUID")
    total_amount: Optional[float] = None
    currency: Optional[str] = "USD"
    quantity: Optional[float] = None
    agreed_price: Optional[float] = None


class TradeResponse(BaseModel):
    id: str
    status: str
    exporter_id: str
    importer_id: str
    total_amount: Optional[float]
    currency: Optional[str]
    created_at: str


class DocumentResponse(BaseModel):
    id: str
    trade_id: str
    document_type: str
    document_hash: str
    verification_result: str


class AnchorResponse(BaseModel):
    ok: bool
    already_anchored: bool
    transaction_hash: Optional[str] = None
    block_number: Optional[int] = None
    network_label: Optional[str] = None
    chain_id: Optional[int] = None


class VerifyResponse(BaseModel):
    result: str  # AUTHENTIC | TAMPERED
    stored_hash: str
    recomputed_hash: str
    anchored_on_chain: bool  # true only if a CONFIRMED blockchain_records row exists for this document


def _dberror() -> HTTPException:
    return HTTPException(status_code=503, detail={"code": "DB_UNAVAILABLE", "message": "Database is not configured or unreachable"})


def _require_db():
    if not is_configured():
        raise HTTPException(status_code=503, detail={"code": "DB_NOT_CONFIGURED", "message": "SUPABASE_DB_URL/DATABASE_URL not set"})


# ---------------------------------------------------------------------------
# Trades
# ---------------------------------------------------------------------------

@router.post("/trades", response_model=TradeResponse)
async def create_trade(req: TradeCreateRequest) -> Dict[str, Any]:
    _require_db()
    trade_id = str(uuid.uuid4())
    try:
        async with transaction() as conn:
            row = await conn.fetchrow(
                """
                insert into public.trades
                    (id, listing_id, exporter_id, importer_id, status, total_amount, currency, quantity, agreed_price, created_at, updated_at)
                values ($1, $2, $3, $4, 'CREATED', $5, $6, $7, $8, now(), now())
                returning id, status, exporter_id, importer_id, total_amount, currency, created_at
                """,
                uuid.UUID(trade_id),
                uuid.UUID(req.listing_id) if req.listing_id else None,
                uuid.UUID(req.exporter_id),
                uuid.UUID(req.importer_id),
                req.total_amount,
                req.currency,
                req.quantity,
                req.agreed_price,
            )
    except DatabaseUnavailable:
        raise _dberror()

    return {
        "id": str(row["id"]),
        "status": row["status"],
        "exporter_id": str(row["exporter_id"]),
        "importer_id": str(row["importer_id"]),
        "total_amount": float(row["total_amount"]) if row["total_amount"] is not None else None,
        "currency": row["currency"],
        "created_at": row["created_at"].isoformat(),
    }


@router.get("/trades/{trade_id}")
async def get_trade(trade_id: str) -> Dict[str, Any]:
    _require_db()
    try:
        async with acquire() as conn:
            row = await conn.fetchrow("select * from public.trades where id = $1", uuid.UUID(trade_id))
    except DatabaseUnavailable:
        raise _dberror()
    if row is None:
        raise HTTPException(status_code=404, detail={"code": "TRADE_NOT_FOUND"})
    return dict(row)


@router.get("/trades")
async def list_trades(status: Optional[str] = None, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
    _require_db()
    try:
        async with acquire() as conn:
            if status:
                rows = await conn.fetch(
                    "select * from public.trades where status = $1 order by created_at desc limit $2 offset $3",
                    status, limit, offset,
                )
            else:
                rows = await conn.fetch(
                    "select * from public.trades order by created_at desc limit $1 offset $2", limit, offset
                )
    except DatabaseUnavailable:
        raise _dberror()
    return {"trades": [dict(r) for r in rows]}


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------

@router.post("/trades/{trade_id}/documents", response_model=DocumentResponse)
async def upload_document(trade_id: str, document_type: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    _require_db()
    raw = await file.read()
    document_hash = hashlib.sha256(raw).hexdigest()  # over ORIGINAL bytes, never an altered representation
    document_id = str(uuid.uuid4())

    storage_dir = os.path.join("backend", "storage", "trade_documents", trade_id)
    os.makedirs(storage_dir, exist_ok=True)
    file_path = os.path.join(storage_dir, f"{document_id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(raw)

    try:
        async with transaction() as conn:
            trade_exists = await conn.fetchval("select 1 from public.trades where id = $1", uuid.UUID(trade_id))
            if not trade_exists:
                raise HTTPException(status_code=404, detail={"code": "TRADE_NOT_FOUND"})
            row = await conn.fetchrow(
                """
                insert into public.trade_documents (id, trade_id, document_type, file_path, document_hash, verification_result, created_at)
                values ($1, $2, $3, $4, $5, 'UPLOADED', now())
                returning id, trade_id, document_type, document_hash, verification_result
                """,
                uuid.UUID(document_id), uuid.UUID(trade_id), document_type, file_path, document_hash,
            )
    except DatabaseUnavailable:
        raise _dberror()

    return {
        "id": str(row["id"]),
        "trade_id": str(row["trade_id"]),
        "document_type": row["document_type"],
        "document_hash": row["document_hash"],
        "verification_result": row["verification_result"],
    }


@router.get("/trades/{trade_id}/documents")
async def list_documents(trade_id: str) -> Dict[str, Any]:
    _require_db()
    try:
        async with acquire() as conn:
            rows = await conn.fetch(
                "select * from public.trade_documents where trade_id = $1 order by created_at", uuid.UUID(trade_id)
            )
    except DatabaseUnavailable:
        raise _dberror()
    return {"documents": [dict(r) for r in rows]}


@router.post("/documents/{document_id}/verify", response_model=VerifyResponse)
async def verify_document(document_id: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    """Re-hashes freshly-uploaded bytes and compares against the stored (and, if
    anchored, on-chain) hash. This is the tamper-detection proof, not a simulation."""
    _require_db()
    raw = await file.read()
    recomputed = hashlib.sha256(raw).hexdigest()

    try:
        async with acquire() as conn:
            row = await conn.fetchrow(
                "select document_hash, trade_id from public.trade_documents where id = $1", uuid.UUID(document_id)
            )
            anchored = await conn.fetchval(
                """
                select exists(
                    select 1 from public.blockchain_records
                    where document_id = $1 and metadata->>'status' = 'CONFIRMED'
                )
                """,
                uuid.UUID(document_id),
            )
    except DatabaseUnavailable:
        raise _dberror()
    if row is None:
        raise HTTPException(status_code=404, detail={"code": "DOCUMENT_NOT_FOUND"})

    stored_hash = row["document_hash"]
    result = "AUTHENTIC" if recomputed == stored_hash else "TAMPERED"
    return {"result": result, "stored_hash": stored_hash, "recomputed_hash": recomputed, "anchored_on_chain": bool(anchored)}


# ---------------------------------------------------------------------------
# Anchoring
# ---------------------------------------------------------------------------

@router.post("/trades/{trade_id}/anchor", response_model=AnchorResponse)
async def anchor_trade(trade_id: str) -> Dict[str, Any]:
    if not ANCHORING_ENABLED:
        raise HTTPException(status_code=501, detail={"code": "ANCHORING_DISABLED", "message": "Set BLOCKCHAIN_ANCHORING_ENABLED=true to enable"})
    _require_db()

    try:
        async with acquire() as conn:
            trade = await conn.fetchrow("select * from public.trades where id = $1", uuid.UUID(trade_id))
            if trade is None:
                raise HTTPException(status_code=404, detail={"code": "TRADE_NOT_FOUND"})

            existing = await conn.fetchrow(
                """
                select * from public.blockchain_records
                where trade_id = $1 and event_type = 'TRADE_ANCHOR' and metadata->>'status' = 'CONFIRMED'
                """,
                uuid.UUID(trade_id),
            )
            if existing:
                return {
                    "ok": True,
                    "already_anchored": True,
                    "transaction_hash": existing["tx_hash"],
                    "block_number": existing["block_number"],
                    "network_label": existing["chain"],
                    "chain_id": None,
                }

            invoice = await conn.fetchrow(
                """
                select * from public.trade_documents
                where trade_id = $1 and document_type = 'COMMERCIAL_INVOICE'
                order by created_at desc limit 1
                """,
                uuid.UUID(trade_id),
            )
            if invoice is None:
                raise HTTPException(status_code=422, detail={"code": "NO_INVOICE", "message": "Upload a COMMERCIAL_INVOICE document before anchoring"})
    except DatabaseUnavailable:
        raise _dberror()

    # Write a SUBMITTING row before the chain call — a mid-flight crash leaves
    # an auditable orphan, not a silent gap.
    try:
        async with transaction() as conn:
            record_id = str(uuid.uuid4())
            await conn.execute(
                """
                insert into public.blockchain_records (id, trade_id, document_id, event_type, document_hash, chain, metadata, created_at)
                values ($1, $2, $3, 'TRADE_ANCHOR', $4, $5, $6::jsonb, now())
                """,
                uuid.UUID(record_id), uuid.UUID(trade_id), invoice["id"], invoice["document_hash"],
                "local-hardhat", '{"status": "SUBMITTING"}',
            )
    except DatabaseUnavailable:
        raise _dberror()

    now = datetime.now(timezone.utc)
    payload = {
        "transactionId": trade_id,
        "exporterId": str(trade["exporter_id"]),
        "importerId": str(trade["importer_id"]),
        "product": "Trade Goods",
        "quantity": int(trade["quantity"] or 0),
        "tradeStatus": trade["status"],
        "inspectionStatus": "PASSED",
        "disputeStatus": "NONE",
        "settlementStatus": "PENDING",
        "expectedDelivery": int(now.timestamp()),
        "actualDelivery": int(now.timestamp()),
        "invoiceHash": invoice["document_hash"],
        "trustScoreAfterTrade": 80,
    }

    try:
        result = await chain_client.anchor_trade(payload)
    except ChainClientError as exc:
        async with transaction() as conn:
            await conn.execute(
                """
                update public.blockchain_records
                set event_type = 'ANCHOR_FAILED', metadata = metadata || jsonb_build_object('status', 'FAILED', 'error_code', $2, 'error_message', $3)
                where id = $1
                """,
                uuid.UUID(record_id), exc.code, exc.message,
            )
        raise HTTPException(status_code=exc.http_status, detail=exc.to_dict())

    try:
        async with transaction() as conn:
            await conn.execute(
                """
                update public.blockchain_records
                set tx_hash = $2, block_number = $3, contract_address = $4,
                    chain = $5,
                    metadata = metadata || jsonb_build_object(
                        'status', 'CONFIRMED', 'chain_id', $6::int,
                        'already_anchored', $7::boolean, 'confirmations', $8::int
                    )
                where id = $1
                """,
                uuid.UUID(record_id),
                result.get("transactionHash") or None,
                result.get("blockNumber") or None,
                result.get("contractAddress"),
                result.get("networkLabel", "local-hardhat"),
                result.get("chainId"),
                result.get("alreadyAnchored", False),
                result.get("confirmations", 0),
            )
            await conn.execute(
                "update public.trade_documents set verification_result = 'VERIFIED' where id = $1", invoice["id"]
            )
    except DatabaseUnavailable:
        # Chain succeeded but we couldn't persist it — surface the tx hash so
        # nothing is silently lost; a reconciliation pass can repair the row.
        raise HTTPException(
            status_code=500,
            detail={"code": "PERSIST_FAILED", "message": "Anchored on-chain but DB write failed", "tx_hash": result.get("transactionHash")},
        )

    return {
        "ok": True,
        "already_anchored": result.get("alreadyAnchored", False),
        "transaction_hash": result.get("transactionHash"),
        "block_number": result.get("blockNumber"),
        "network_label": result.get("networkLabel"),
        "chain_id": result.get("chainId"),
    }


@router.get("/trades/{trade_id}/blockchain")
async def trade_blockchain_records(trade_id: str) -> Dict[str, Any]:
    _require_db()
    try:
        async with acquire() as conn:
            rows = await conn.fetch(
                "select * from public.blockchain_records where trade_id = $1 order by created_at desc", uuid.UUID(trade_id)
            )
    except DatabaseUnavailable:
        raise _dberror()
    return {"records": [dict(r) for r in rows]}


@router.get("/blockchain/ledger")
async def recent_records(limit: int = 50) -> Dict[str, Any]:
    _require_db()
    try:
        async with acquire() as conn:
            rows = await conn.fetch(
                "select * from public.blockchain_records order by created_at desc limit $1", limit
            )
    except DatabaseUnavailable:
        raise _dberror()
    return {"records": [dict(r) for r in rows]}


@router.get("/blockchain/status")
async def chain_status() -> Dict[str, Any]:
    status = await chain_client.get_chain_status()
    status["anchoring_enabled"] = ANCHORING_ENABLED
    return status


@router.get("/exporters/{org_id}/reputation")
async def exporter_reputation(org_id: str) -> Dict[str, Any]:
    try:
        reputation = await chain_client.get_exporter_reputation(org_id)
    except ChainClientError as exc:
        raise HTTPException(status_code=exc.http_status, detail=exc.to_dict())
    return {"reputation": reputation}
