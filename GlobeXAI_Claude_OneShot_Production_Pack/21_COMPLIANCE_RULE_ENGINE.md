# Compliance Rule Engine

## Principle

RAG retrieves evidence.
Rules determine decisions.

LLM text generation never directly authorizes a transaction.

## Rule structure

```json
{
  "rule_id": "...",
  "jurisdiction": "...",
  "condition": "...",
  "action": "PASS|REVIEW|BLOCK",
  "source_ids": [],
  "effective_from": "...",
  "effective_to": "..."
}
```

## Precedence

1. Explicit applicable prohibition → BLOCK
2. Mandatory unresolved authorization → REVIEW
3. Verified requirement satisfied → PASS
4. Missing authoritative coverage → UNSUPPORTED

## Overrides

No frontend bypass.

Human override requires:
- authorized role;
- reason;
- evidence;
- timestamp;
- reviewer identity;
- audit record.
