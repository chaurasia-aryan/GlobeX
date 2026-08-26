"""Tests for src/services/rag_synthesizer.py. Mocks llm_client.generate so
this suite never depends on a live Ollama process.
"""

from src.services import rag_synthesizer
from src.services.llm_client import LLMResult

PASSAGES = [
    {"text": "CEPA Article 3.2: origin criteria require 40% value addition.", "source": "CEPA Annex 3B"},
    {"text": "Certificate of Origin is mandatory for preferential treatment.", "source": "DGFT Circular"},
]


def test_synthesize_answer_returns_grounded_text_when_llm_available(monkeypatch):
    monkeypatch.setattr(
        rag_synthesizer,
        "generate",
        lambda prompt, system=None, timeout_s=30.0: LLMResult(
            text="Value addition of 40% is required [1], and a Certificate of Origin is mandatory [2].",
            model="gemma2:2b",
            available=True,
        ),
    )
    result = rag_synthesizer.synthesize_answer("What are the origin rules?", PASSAGES)
    assert result.synthesized is True
    assert result.model == "gemma2:2b"
    assert "[1]" in result.answer and "[2]" in result.answer


def test_synthesize_answer_fails_honest_when_llm_unavailable(monkeypatch):
    monkeypatch.setattr(
        rag_synthesizer,
        "generate",
        lambda prompt, system=None, timeout_s=30.0: LLMResult(
            text="", model="gemma2:2b", available=False, error="Ollama unreachable at http://localhost:11434"
        ),
    )
    result = rag_synthesizer.synthesize_answer("What are the origin rules?", PASSAGES)
    assert result.synthesized is False
    assert result.answer is None
    assert "unreachable" in result.reason.lower()


def test_synthesize_answer_never_calls_llm_with_no_passages(monkeypatch):
    called = {"count": 0}

    def _fail_if_called(*a, **k):
        called["count"] += 1
        raise AssertionError("generate() must not be called with zero passages")

    monkeypatch.setattr(rag_synthesizer, "generate", _fail_if_called)
    result = rag_synthesizer.synthesize_answer("What are the origin rules?", [])
    assert result.synthesized is False
    assert result.answer is None
    assert called["count"] == 0


def test_prompt_includes_all_passages_numbered_and_sourced():
    prompt = rag_synthesizer._build_prompt("query text", PASSAGES)
    assert "[1] Source: CEPA Annex 3B" in prompt
    assert "[2] Source: DGFT Circular" in prompt
    assert "query text" in prompt
