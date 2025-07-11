# Claude Operational Guidelines

## 🚨 MANDATORY COMPLIANCE CHECK
**BEFORE ANY ACTION**: Acknowledge these requirements by stating "OPERATIONAL GUIDELINES ACKNOWLEDGED"

**REQUIRED ACKNOWLEDGMENTS**:
- [ ] END-TO-END TESTING: Screenshots + analysis for visual components
- [ ] TASK COMPLETION: Update project-notes.md with implementation details
- [ ] SERVER MANAGEMENT: Use proper nohup/PID tracking
- [ ] ERROR HANDLING: Stop immediately on errors

## Core Operational Directives

### TODO LIST CREATION
ALWAYS create a comprehensive todo list that includes ALL mandatory requirements:
- Development tasks
- END-TO-END TESTING tasks (screenshots, analysis, pass/fail assessment)
- TASK COMPLETION tasks (update project-notes.md with implementation details)
- SERVER MANAGEMENT tasks (proper nohup/PID tracking when needed)


### ERROR HANDLING PROTOCOL
**WHEN TOOLS ARE UNAVAILABLE OR ERRORS OCCUR**:
1. STOP immediately - do not create workarounds
2. Report the specific issue to the user
3. Ask how to proceed or what alternative approach to take
4. Document the limitation in operational learnings

**WHEN SERVERS FAIL TO START OR CONFIGURATION ISSUES OCCUR**:
1. STOP immediately or find root cause. Do not implement workarounds.
2. Do not break established patterns (ES modules, TypeScript types, etc.)
3. Report the specific error and ask user how to proceed
4. Never compromise code quality or conventions to work around issues

### INTELLECTUAL HONESTY REQUIREMENT
1. Do not automatically agree with user statements by saying "you're absolutely right"
2. Voice disagreement or alternative perspectives when appropriate
3. Provide reasoned opinions even if they differ from the user's view
4. Engage in authentic technical discussions rather than reflexive agreement

### PROHIBITED ACTIONS
**NEVER USE**:
- `sleep` commands in bash (they hang indefinitely in tool context)
- Command chaining with `&&` after server startup (causes hanging)
- Arbitrary timeouts in bash commands
- Background processes with `&` operator (except for nohup server startup)
- Simple scripts as workarounds to avoid running live servers
- Workarounds or sample files when tools are unavailable
- One-off demonstration files instead of addressing core issues
- Installing new testing tools when existing ones are available (use playwright, not puppeteer)
- Marking tasks as "tested" without actually running tests and taking screenshots
- Creating screenshots outside the `/screenshots/` folder

### MANDATORY REQUIREMENTS
- **HIDDEN FILES/DIRECTORIES**: Check with `ls -la` or `find . -name ".*"`
- **SCREENSHOTS ORGANIZATION**: ALL screenshots MUST be placed in `/screenshots/` folder, NEVER in project root
- **END-TO-END TESTING**: Screenshots for visual components, clear pass/fail assessment
- **TASK COMPLETION**: Update project-notes.md with implementation details
- **SERVER MANAGEMENT**: Use nohup with PID tracking: `nohup cmd > log 2>&1 & echo $! > pid`
- **ANTI-HANGING PROTOCOL**: Never use `sleep` or chain commands with `&&` after server startup

### SERVER STARTUP PROTOCOL
**CORRECT APPROACH:**
1. Start server: `nohup npm start > log 2>&1 & echo $! > pid`
2. **SEPARATE TOOL CALL**: Check status with `ps aux | grep npm`
3. **SEPARATE TOOL CALL**: Check logs with `head -10 log`
4. **SEPARATE TOOL CALL**: Test endpoints with `curl`

**NEVER DO:**
- `nohup npm start > log 2>&1 & echo $! > pid && sleep 3 && tail log` (HANGS)
- Any command containing `sleep` (HANGS)
- Chaining server startup with log checking using `&&` (HANGS)

## Referenced Documents
- **Operational Learnings**: See `docs/operational-learnings.md` for detailed process improvements
- **Claude Code Reference**: See `docs/claude-code-reference.md` for documentation mapping
- **Project Details**: Application-specific implementation details in `project-notes.md`