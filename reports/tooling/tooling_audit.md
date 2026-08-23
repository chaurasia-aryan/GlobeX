# Tooling Audit — Phase 0

Date: 2026-08-23
Environment: Windows 11, Git Bash / PowerShell, Claude Code 2.1.241

| Tool | Required | Version Found | Status | Verification Command | Purpose |
|---|---|---|---|---|---|
| Node.js | Yes (20+) | v22.17.1 | OK | `node --version` | Frontend build (Vite/React), tooling |
| npm | Yes | 11.12.1 | OK | `npm --version` | Package management |
| Python | Yes | 3.12.5 | OK | `python --version` | FastAPI backend, ML notebooks |
| git | Yes | 2.50.0.windows.2 | OK | `git --version` | Version control |
| Claude Code | Yes | 2.1.241 | OK | `claude --version` | Agent execution |
| Docker | Optional | not installed | SKIPPED | `docker --version` → command not found | Not installed; not currently required by any repo script that was invoked in this session. Revisit if a containerized integration test is added later. |
| GitHub CLI (`gh`) | Optional | not installed | SKIPPED | `gh --version` → command not found | No repo/PR/API operations requested this run. |
| PostgreSQL client (`psql`) | Optional | not checked | NOT NEEDED YET | — | DB inspection will go through the app's existing Supabase/PG client libraries first; will install only if direct psql access becomes necessary. |

## Playwright MCP

Command run:
```
claude mcp add playwright npx @playwright/mcp@latest
```
Result: `Added stdio MCP server playwright with command: npx @playwright/mcp@latest to local config`

Verification:
```
claude mcp list
```
Result:
```
claude.ai Google Drive: https://drivemcp.googleapis.com/mcp/v1 - ✔ Connected
playwright: npx @playwright/mcp@latest - ✔ Connected
```

**Status: CONFIGURED, SMOKE TEST NOT YET PERFORMED.**

The MCP server reports `Connected` at the process/health-check level, but this running Claude Code session was started before the server was registered, so its browser tool set (`browser_navigate`, `browser_snapshot`, etc.) is not yet exposed to this session's tool router (`ToolSearch` returns no matches for `mcp__playwright__*`). This is expected behavior for `claude mcp add` — newly added MCP servers' tools become available on the next session start.

This is recorded as a genuine result, not fabricated as a pass: **the smoke test against a harmless public test page is deferred to the first tool call in a session started after this registration.** No Playwright-dependent phase (E2E testing, live frontend verification) can be marked complete until that smoke test actually runs.

## Not installed / not attempted

Nothing else was installed. No arbitrary MCP servers were added. No browser extensions, scraping/bypass tools, or CAPTCHA-bypass tools were installed, per the tooling bootstrap security constraints.
