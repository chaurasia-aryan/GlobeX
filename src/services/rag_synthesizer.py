"""
Generation layer on top of `rag_retriever.py`'s TF-IDF retrieval. Retrieval
alone is search, not RAG — this grounds an LLM-written answer strictly in
the retrieved passages and requires a citation per claim. If the local LLM
(Ollama) is unavailable, this returns the raw passages untouched with
`synthesized=False` — it never fabricates an answer to paper over a down
LLM, same "fail honest" convention as the rest of this codebase.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from src.services.llm_client import generate

SYSTEM_PROMPT = (
    "You are a trade-compliance research assistant. Answer strictly using only the "
    "numbered passages provided below — do not use outside knowledge. For every claim, "
    "cite the passage number(s) that support it, like [1] or [2][3]. If the passages do "
    "not contain enough information to answer, say so explicitly instead of guessing. "
    "Never invent facts, sources, regulations, or numbers not present in the passages."
)


@dataclass
class SynthesisResult:
    answer: Optional[str]
    synthesized: bool
    model: Optional[str] = None
    reason: Optional[str] = None


def _build_prompt(query: str, retrieved_passages: List[Dict[str, Any]]) -> str:
    numbered = "\n\n".join(
        f"[{i + 1}] Source: {p.get('source', 'unknown')}\n{p.get('text', '')}"
        for i, p in enumerate(retrieved_passages)
    )
    return f"Passages:\n{numbered}\n\nQuestion: {query}\n\nAnswer (cite passage numbers for every claim):"


def synthesize_answer(query: str, retrieved_passages: List[Dict[str, Any]]) -> SynthesisResult:
    if not retrieved_passages:
        return SynthesisResult(answer=None, synthesized=False, reason="No retrieved passages to ground an answer in.")

    result = generate(_build_prompt(query, retrieved_passages), system=SYSTEM_PROMPT)

    if not result.available:
        return SynthesisResult(
            answer=None,
            synthesized=False,
            reason=result.error or "Local LLM (Ollama) is unavailable.",
        )

    return SynthesisResult(answer=result.text, synthesized=True, model=result.model)
