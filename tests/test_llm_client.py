"""Tests for src/services/llm_client.py. Mocks the Ollama HTTP call so this
suite never depends on a live Ollama process — CI has no local LLM running.
"""

import httpx
import pytest

from src.services.llm_client import generate


class _FakeResponse:
    def __init__(self, json_data, status_code=200):
        self._json = json_data
        self.status_code = status_code

    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError("error", request=None, response=self)

    def json(self):
        return self._json


def test_generate_returns_available_result_on_success(monkeypatch):
    monkeypatch.setattr(httpx, "post", lambda *a, **k: _FakeResponse({"response": "Grounded answer [1]."}))
    result = generate("What is the rule?")
    assert result.available is True
    assert result.text == "Grounded answer [1]."
    assert result.error is None


def test_generate_fails_honest_when_ollama_unreachable(monkeypatch):
    def _raise(*a, **k):
        raise httpx.ConnectError("connection refused")

    monkeypatch.setattr(httpx, "post", _raise)
    result = generate("What is the rule?")
    assert result.available is False
    assert result.text == ""
    assert "unreachable" in result.error.lower()


def test_generate_fails_honest_on_timeout(monkeypatch):
    def _raise(*a, **k):
        raise httpx.TimeoutException("timed out")

    monkeypatch.setattr(httpx, "post", _raise)
    result = generate("What is the rule?", timeout_s=5)
    assert result.available is False
    assert "timed out" in result.error.lower()


def test_generate_fails_honest_on_empty_response(monkeypatch):
    monkeypatch.setattr(httpx, "post", lambda *a, **k: _FakeResponse({"response": "   "}))
    result = generate("What is the rule?")
    assert result.available is False
    assert "empty" in result.error.lower()


def test_generate_never_raises_on_unexpected_failure(monkeypatch):
    def _raise(*a, **k):
        raise ValueError("unexpected")

    monkeypatch.setattr(httpx, "post", _raise)
    result = generate("What is the rule?")
    assert result.available is False
    assert result.error == "unexpected"
