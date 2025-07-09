# Project Memory - Claude Code Documentation

## 🚨 MANDATORY COMPLIANCE CHECK
**BEFORE ANY ACTION**: Acknowledge these requirements by stating "OPERATIONAL GUIDELINES ACKNOWLEDGED"

**REQUIRED ACKNOWLEDGMENTS**:
- [ ] END-TO-END TESTING: Screenshots + analysis for visual components
- [ ] TASK COMPLETION: Update CLAUDE.md with operational learnings  
- [ ] SERVER MANAGEMENT: Use proper nohup/PID tracking
- [ ] ERROR HANDLING: Stop immediately on errors

## Operational Guidelines for All Projects

### Mandatory Requirements
**BEFORE ANY ACTION**: Check these guidelines and acknowledge compliance.

**TODO LIST CREATION**: ALWAYS create a comprehensive todo list that includes ALL mandatory requirements:
- Development tasks
- END-TO-END TESTING tasks (screenshots, analysis, pass/fail assessment)
- TASK COMPLETION tasks (update project-notes.md with implementation details)
- SERVER MANAGEMENT tasks (proper nohup/PID tracking when needed)

**HIDDEN FILES/DIRECTORIES**: ALWAYS check for hidden files and directories (.claude, .git, etc.) using `ls -la` or `find . -name ".*"` rather than relying solely on Glob/LS tools which may miss them.

**END-TO-END TESTING**: When tools are available:
- Screenshots for visual components (saved in `screenshots/` folder)
- Screenshot analysis verifying expected behavior
- Clear pass/fail assessment for each major feature
- If screenshot tools are unavailable, STOP and ask user how to proceed
- NEVER create workarounds or sample files to demonstrate functionality

**TASK COMPLETION**: Always end tasks with updates to project-notes.md documenting implementation details and operational learnings to CLAUDE.md only for process improvements.

### Prohibited Actions
**NEVER USE**: 
- Arbitrary timeouts in bash commands
- Background processes with `&` operator
- Simple scripts as workarounds to avoid running live servers
- Workarounds or sample files when tools are unavailable
- One-off demonstration files instead of addressing core issues

### Error Handling Protocol
**WHEN TOOLS ARE UNAVAILABLE OR ERRORS OCCUR**:
1. STOP immediately - do not create workarounds
2. Report the specific issue to the user
3. Ask how to proceed or what alternative approach to take
4. Document the limitation in operational learnings

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

## Process Improvements

### Documentation Structure (2025-07-09)
**Improvement**: Separated operational guidelines from application-specific content.

**Implementation**: 
- CLAUDE.md contains only general operational guidelines
- project-notes.md contains application-specific implementation details
- Error handling protocol: stop and ask when tools unavailable, no workarounds

**Outcome**: Cleaner separation of concerns and better operational discipline.

---

*Application-specific implementation details and learnings are documented in project-notes.md*