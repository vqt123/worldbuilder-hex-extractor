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
- TASK COMPLETION tasks (update CLAUDE.md with learnings)
- SERVER MANAGEMENT tasks (proper nohup/PID tracking when needed)

**HIDDEN FILES/DIRECTORIES**: ALWAYS check for hidden files and directories (.claude, .git, etc.) using `ls -la` or `find . -name ".*"` rather than relying solely on Glob/LS tools which may miss them.

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

## Operational Learnings

### Redundancy Consolidation (2025-07-09)
**Issue**: Duplicate requirements listed in both CLAUDE.md and .claude/compliance_hook.sh created maintenance burden and potential inconsistencies.

**Solution**: 
- Centralized all requirements in CLAUDE.md as single source of truth
- Updated compliance_hook.sh to reference CLAUDE.md instead of duplicating requirements
- Reduced hook script from 25 lines to 21 lines by removing duplicate text

**Outcome**: Eliminated redundancy while maintaining hook functionality. Future requirement changes only need to be made in CLAUDE.md.

### Multiplayer Game Implementation (2025-07-09)
**Task**: Create first step of simple realtime multiplayer game with 2D grid movement.

**Implementation**:
- HTML5 Canvas-based 2D grid rendering system (800x600px, 40px grid cells)
- WebSocket server using Node.js `ws` library for real-time communication
- Client-side JavaScript with WASD/Arrow key controls and click-to-move
- Game state synchronization across all connected players
- Collision detection preventing multiple players on same grid cell
- Player color assignment system with unique colors per player
- Connection status indicators and player list UI

**Technical Details**:
- Server: Node.js with WebSocket on port 3000, serves static files and game logic
- Client: Canvas rendering with 60fps game loop, event-driven movement
- Protocol: JSON message types (welcome, gameState, playerJoined, playerLeft, playerMoved)
- Grid: 20x15 cells with boundary enforcement and collision detection

**Testing Results**: PASS - Screenshot analysis confirmed proper grid rendering, player spawning, WebSocket connectivity, and UI functionality.

**Key Learnings**:
- nohup/PID tracking essential for proper server lifecycle management
- Canvas-based games require careful event handling for smooth multiplayer experience
- WebSocket connection state management crucial for reconnection handling