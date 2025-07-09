# Project Memory - Claude Code Documentation

## Operational Guidelines for All Projects

### Mandatory Requirements
**BEFORE ANY ACTION**: Check these guidelines and acknowledge compliance.

**END-TO-END TESTING**: Every completed task set MUST include:
- Screenshots for visual components (saved in `screenshots/` folder)
- Screenshot analysis verifying expected behavior
- Clear pass/fail assessment for each major feature
- Apply after substantial development work, before marking tasks complete

**TASK COMPLETION**: Always end tasks with updates to CLAUDE.md documenting operational learnings.

### Prohibited Actions
**NEVER USE**: 
- Arbitrary timeouts in bash commands
- Background processes with `&` operator
- Simple scripts as workarounds to avoid running live servers

### Server Management Solution
Use `nohup` with PID tracking for proper server lifecycle management:
```bash
nohup npm start > server.log 2>&1 & echo $! > server.pid
# Test server functionality
kill $(cat server.pid) && rm server.pid
```

## Claude Code Documentation Reference

### Quick Reference
When users ask about Claude Code features, ALWAYS reference local files in `claude-code-docs/` instead of web requests.

**Common Questions → Files**:
- VS Code integration → `ide-integrations.md`
- MCP servers → `mcp.md`
- GitHub Actions → `github-actions.md`
- Capabilities → `overview.md`
- Memory files → `memory.md`
- Custom commands → `slash-commands.md`
- Troubleshooting → `troubleshooting.md`

**Keywords → Files**:
- hooks, automation → `hooks.md`
- memory, context → `memory.md`
- slash, commands → `slash-commands.md`
- interactive, shortcuts → `interactive-mode.md`
- devcontainer, docker → `devcontainer.md`
- proxy, corporate → `corporate-proxy.md`

**All Files**: `overview.md`, `quickstart.md`, `cli-reference.md`, `interactive-mode.md`, `common-workflows.md`, `settings.md`, `memory.md`, `slash-commands.md`, `hooks.md`, `ide-integrations.md`, `mcp.md`, `github-actions.md`, `sdk.md`, `iam.md`, `security.md`, `third-party-integrations.md`, `amazon-bedrock.md`, `google-vertex-ai.md`, `corporate-proxy.md`, `llm-gateway.md`, `devcontainer.md`, `monitoring-usage.md`, `costs.md`, `troubleshooting.md`