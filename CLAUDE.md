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
- Arbitrary timeouts in bash commands
- Background processes with `&` operator
- Simple scripts as workarounds to avoid running live servers
- Workarounds or sample files when tools are unavailable
- One-off demonstration files instead of addressing core issues
- Installing new testing tools when existing ones are available (use playwright, not puppeteer)
- Marking tasks as "tested" without actually running tests and taking screenshots

### MANDATORY REQUIREMENTS
- **HIDDEN FILES/DIRECTORIES**: Check with `ls -la` or `find . -name ".*"`
- **END-TO-END TESTING**: Screenshots for visual components, clear pass/fail assessment
- **TASK COMPLETION**: Update project-notes.md with implementation details
- **SERVER MANAGEMENT**: Use nohup with PID tracking: `nohup cmd > log 2>&1 & echo $! > pid`

## Referenced Documents
- **Operational Learnings**: See `operational-learnings.md` for detailed process improvements
- **Claude Code Reference**: See `claude-code-reference.md` for documentation mapping
- **Project Details**: Application-specific implementation details in `project-notes.md`