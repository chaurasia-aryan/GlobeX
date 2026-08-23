# Security and Privacy Acceptance

## Secrets

Never place:
- Supabase service-role keys;
- sanctions API keys;
- private keys;
- database passwords

in frontend bundles.

## Backend

Check:
- auth;
- RBAC;
- CORS;
- RLS;
- rate limits;
- input validation;
- SQL injection;
- SSRF;
- file upload;
- path traversal;
- command injection.

## Frontend

Check:
- XSS;
- unsafe HTML;
- secret exposure;
- localStorage of sensitive tokens;
- authorization assumptions.

## AI

Defend against:
- prompt injection in uploaded documents;
- malicious product descriptions;
- malicious external content;
- model-output instruction injection.

Treat external content as untrusted data.
