"""
Local RAG retriever over GlobeXAI's real compliance/tariff corpus.

No external LLM, no API key, no model download. Retrieval is TF-IDF +
cosine similarity (scikit-learn, already a project dependency) over a small,
bounded, fully-real corpus built from data already live elsewhere in this
codebase:

  - _TREATY_MAP treaty names, preferential/MFN rates, NTM barriers
    (src/api/compliance_api.py)
  - _PRODUCT_DOCUMENTS / _DEFAULT_DOCUMENTS mandatory document requirements
  - Live WITS TRAINS MFN rates (src/compliance/wits_tariff.py) for corridors
    with no documented treaty
  - Sanctions list provenance (src/compliance/entity_screening.py source_registry)

Every retrieved passage carries `source` provenance. Nothing here is
generated text — this module only retrieves and ranks real passages; a
caller composes them into prose (see report_synthesizer.py).
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


@dataclass
class Passage:
    text: str
    source: str
    metadata: Dict[str, Any]


def _treaty_passages() -> List[Passage]:
    from src.api.compliance_api import _TREATY_MAP  # noqa: PLC0415

    passages = []
    for (origin, dest), treaty in _TREATY_MAP.items():
        ntms = "; ".join(treaty["ntm_barriers"])
        text = (
            f"{origin} to {dest}: {treaty['agreement']}. "
            f"Preferential duty {treaty['preferential_rate_pct']}%, standard MFN duty "
            f"{treaty['standard_mfn_rate_pct']}%. Non-tariff measures: {ntms}."
        )
        passages.append(Passage(
            text=text,
            source="compliance_api._TREATY_MAP",
            metadata={"origin": origin, "destination": dest, "type": "treaty", **treaty},
        ))
    return passages


def _document_passages() -> List[Passage]:
    from src.api.compliance_api import _PRODUCT_DOCUMENTS, _DEFAULT_DOCUMENTS  # noqa: PLC0415

    passages = []
    for hs6, docs in _PRODUCT_DOCUMENTS.items():
        for d in docs:
            req = "mandatory" if d["mandatory"] else "optional"
            text = f"HS6 {hs6}: {d['name']} ({req}), issued by {d['issuing_authority']}."
            passages.append(Passage(
                text=text, source="compliance_api._PRODUCT_DOCUMENTS",
                metadata={"hs6": hs6, "type": "document", **d},
            ))
    for d in _DEFAULT_DOCUMENTS:
        req = "mandatory" if d["mandatory"] else "optional"
        text = f"Default (any HS6): {d['name']} ({req}), issued by {d['issuing_authority']}."
        passages.append(Passage(
            text=text, source="compliance_api._DEFAULT_DOCUMENTS",
            metadata={"hs6": None, "type": "document", **d},
        ))
    return passages


def _sanctions_provenance_passages() -> List[Passage]:
    here = os.path.dirname(os.path.abspath(__file__))
    repo = os.path.dirname(os.path.dirname(here))
    reg_path = os.path.join(repo, "backend", "brain", "compliance_data", "sanctions_entities", "source_registry.json")
    if not os.path.exists(reg_path):
        return []
    with open(reg_path, "r", encoding="utf-8") as f:
        reg = json.load(f)
    passages = []
    for src in reg.get("sources_fetched_successfully", []):
        text = (
            f"Sanctions screening covers {src['source']} ({src.get('authority', '')}), "
            f"{src.get('record_count', 0)} entities, retrieved {src.get('retrieved_at', '')}."
        )
        passages.append(Passage(text=text, source="entity_screening.source_registry",
                                 metadata={"type": "sanctions_coverage", **src}))
    for src in reg.get("sources_unsupported", []):
        text = f"Sanctions screening does NOT cover {src['source']}: {src['reason']}"
        passages.append(Passage(text=text, source="entity_screening.source_registry",
                                 metadata={"type": "sanctions_gap", **src}))
    return passages


def _wits_tariff_passage(origin_iso3: str, hs6: int) -> Optional[Passage]:
    from src.compliance.wits_tariff import fetch_mfn_tariff  # noqa: PLC0415

    result = fetch_mfn_tariff(origin_iso3, hs6)
    if result is None:
        return None
    text = (
        f"WITS TRAINS: {origin_iso3} applies a real-world MFN tariff of "
        f"{result['rate_pct']}% on HS6 {hs6} as of {result['year']} "
        f"(no documented preferential agreement for this specific corridor)."
    )
    return Passage(text=text, source="WITS_TRAINS_live", metadata={"type": "wits_mfn", **result})


class ComplianceRAGRetriever:
    """Builds a TF-IDF index over the static corpus once, on first use."""

    def __init__(self) -> None:
        self._passages: List[Passage] = []
        self._vectorizer: Optional[TfidfVectorizer] = None
        self._matrix = None

    def _ensure_index(self) -> None:
        if self._vectorizer is not None:
            return
        self._passages = _treaty_passages() + _document_passages() + _sanctions_provenance_passages()
        if not self._passages:
            logger.warning("RAG retriever: empty corpus")
            return
        self._vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self._matrix = self._vectorizer.fit_transform([p.text for p in self._passages])

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        origin_iso3: Optional[str] = None,
        destination_iso3: Optional[str] = None,
        hs6: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Real retrieval: TF-IDF cosine similarity over the static corpus,
        plus a live WITS lookup appended when the exact (origin, destination)
        corridor has no documented treaty in the corpus."""
        self._ensure_index()
        results: List[Dict[str, Any]] = []

        if self._vectorizer is not None and self._passages:
            qvec = self._vectorizer.transform([query])
            sims = cosine_similarity(qvec, self._matrix)[0]
            ranked = sorted(range(len(sims)), key=lambda i: sims[i], reverse=True)
            for i in ranked[:top_k]:
                if sims[i] <= 0.0:
                    continue
                p = self._passages[i]
                results.append({
                    "text": p.text, "source": p.source,
                    "relevance": round(float(sims[i]), 4), "metadata": p.metadata,
                })

        if origin_iso3 and destination_iso3 and hs6:
            from src.api.compliance_api import _TREATY_MAP  # noqa: PLC0415

            if (origin_iso3, destination_iso3) not in _TREATY_MAP:
                wits = _wits_tariff_passage(destination_iso3, hs6)
                if wits is not None:
                    results.append({
                        "text": wits.text, "source": wits.source,
                        "relevance": None, "metadata": wits.metadata,
                    })

        return results


_singleton: Optional[ComplianceRAGRetriever] = None


def get_retriever() -> ComplianceRAGRetriever:
    global _singleton
    if _singleton is None:
        _singleton = ComplianceRAGRetriever()
    return _singleton
