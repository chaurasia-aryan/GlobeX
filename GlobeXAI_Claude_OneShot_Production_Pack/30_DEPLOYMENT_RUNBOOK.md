# Deployment Runbook

## Pre-deployment

1. Freeze model versions.
2. Freeze source snapshots.
3. Run tests.
4. Build frontend.
5. Build backend.
6. Validate environment variables.
7. Confirm secrets are server-side.
8. Validate DB migrations.
9. Validate n8n workflows.
10. Run Playwright E2E.

## Production

- start FastAPI;
- start frontend;
- start n8n;
- verify health;
- verify compliance source status;
- execute a non-destructive smoke test.

## Rollback

Rollback:
- application version;
- model version;
- source version;
- database migration if safe.

Never roll back sanctions/compliance data blindly without recording source versions.
