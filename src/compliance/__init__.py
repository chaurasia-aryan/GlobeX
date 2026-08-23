"""GlobeXAI compliance package.

Phase 7 deliverable: a current-fact registry and its loader. This package holds
*current law and current trade facts*, kept deliberately separate from the
historical model artifacts under ``backend/brain``.

Nothing in this package infers, extrapolates or defaults a regulatory value. A
combination with no fact on file resolves to ``UNSUPPORTED``, never to an empty
result that a caller could mistake for "no restrictions".
"""

from src.compliance.current_facts import (  # noqa: F401
    FactStatus,
    CurrentFactRegistry,
    get_current_facts,
    get_registry,
)

__all__ = [
    "FactStatus",
    "CurrentFactRegistry",
    "get_current_facts",
    "get_registry",
]
