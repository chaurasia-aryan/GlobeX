# GlobeXAI Integration Decision Rules

## 1. Existing Code Wins

If a working implementation already exists, integrate it.

Do not replace it with a new implementation merely because a task list requested a new file.

## 2. Existing Model Artifacts Win

Current trained artifacts are the starting point.

Training is not automatically part of integration.

## 3. Ranking Is Not Risk

Market opportunity and trade risk are distinct outputs.

## 4. n8n Is Orchestration

n8n coordinates services and persistence.

It does not replace Python model inference.

## 5. Database Is Canonical Business State

Do not use n8n execution JSON as durable business state.

## 6. ER Diagram Is Reference

Actual migrations/schema must be checked before changing database design.

## 7. Frontend Changes Are Allowed When Necessary

Allowed:
- field changes required by API;
- missing result sections;
- real API wiring;
- loading/error handling;
- type correction;
- broken integration fixes.

Not allowed:
- unnecessary redesign;
- removal of working features without justification.

## 8. Mock Fallbacks

Mocks may remain only as controlled development fallback.

They cannot conceal production integration failure.

## 9. External Dependencies

Unavailable credentials are blockers, not reasons to fabricate output.

## 10. n8n JSON

The final JSON must correspond exactly to the implemented API/database contracts.

Documentation and workflow JSON must never describe different architectures.
