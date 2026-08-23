# Claude Code Tooling Bootstrap

## Required

1. Verify Node.js 20+.
2. Verify Claude Code.
3. Install Playwright MCP:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

4. Verify:

```bash
claude mcp list
```

5. Run a browser smoke test.

## Optional

Install only when required:
- `gh` for GitHub operations;
- Docker for container workflows;
- PostgreSQL client for direct DB inspection.

Do not install arbitrary MCP servers.

## Security

Never store API keys in MCP configuration committed to the repository.

Never use Playwright to bypass CAPTCHA, authentication, robots, or access controls.

Prefer official APIs/downloads.

## Completion

Create:
`reports/tooling/tooling_audit.md`

Record:
- tool;
- version;
- installation status;
- verification command;
- result;
- purpose.
