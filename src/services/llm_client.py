"""
Thin wrapper around a local Ollama instance's HTTP API (no API key, no
per-call cost). Fails honest: if Ollama isn't reachable or times out, this
returns `available=False` with the real error — it never fabricates a
generated answer, matching the "fail honest" pattern already used elsewhere
in this codebase (e.g. risk_integration.py).
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "gemma2:2b")


@dataclass
class LLMResult:
    text: str
    model: str
    available: bool
    error: Optional[str] = None


def generate(prompt: str, system: Optional[str] = None, timeout_s: float = 30.0) -> LLMResult:
    """Calls the local Ollama /api/generate endpoint (non-streaming)."""
    model = OLLAMA_MODEL
    payload = {"model": model, "prompt": prompt, "stream": False}
    if system:
        payload["system"] = system

    try:
        resp = httpx.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload, timeout=timeout_s)
        resp.raise_for_status()
        data = resp.json()
        text = (data.get("response") or "").strip()
        if not text:
            return LLMResult(text="", model=model, available=False, error="Ollama returned an empty response")
        return LLMResult(text=text, model=model, available=True)
    except httpx.ConnectError as exc:
        logger.warning("LLM client: Ollama unreachable at %s: %s", OLLAMA_BASE_URL, exc)
        return LLMResult(text="", model=model, available=False, error=f"Ollama unreachable at {OLLAMA_BASE_URL}")
    except httpx.TimeoutException as exc:
        logger.warning("LLM client: Ollama request timed out after %ss: %s", timeout_s, exc)
        return LLMResult(text="", model=model, available=False, error=f"Ollama timed out after {timeout_s}s")
    except Exception as exc:  # noqa: BLE001 — any failure must fail honest, not raise into the caller
        logger.warning("LLM client: Ollama request failed: %s", exc)
        return LLMResult(text="", model=model, available=False, error=str(exc))
