# Operational Learnings & Process Improvements

## Documentation Structure (2025-07-09)
**Improvement**: Separated operational guidelines from application-specific content.

**Implementation**: 
- CLAUDE.md contains only general operational guidelines
- project-notes.md contains application-specific implementation details
- Error handling protocol: stop and ask when tools unavailable, no workarounds

**Outcome**: Cleaner separation of concerns and better operational discipline.

## Browser Testing with Playwright (2025-07-09)
**Improvement**: For browser-based projects, always use Playwright instead of system screenshot tools.

**Implementation**: 
- Install @playwright/test for browser testing
- Configure headless mode with proper reporter settings
- Set HTML reporter to `open: 'never'` to prevent workflow lockups
- Use line reporter for clean terminal output
- Add npm test script for easy testing

**Outcome**: Reliable browser testing without disrupting development workflow.

## Port Conflict Resolution (2025-07-09)
**Improvement**: Always check for and resolve port conflicts when starting servers.

**Implementation**: 
- Use `lsof -ti:PORT | xargs kill -9` to kill processes on occupied ports
- Verify server startup with curl/HTTP requests
- Check server logs for confirmation of successful startup

**Outcome**: Prevents EADDRINUSE errors and ensures clean server restarts.

## Vite Version Compatibility Resolution (2025-07-10)
**Improvement**: Properly handle Vite version compatibility with Node.js versions.

**Problem**: Vite 7.0.3 introduced `crypto.hash` dependency requiring Node.js 20.12.0+ or 21.7.0+, causing "TypeError: crypto.hash is not a function" on older Node versions.

**Implementation**: 
- Research web-based solutions before attempting workarounds
- Downgrade to compatible Vite version (5.4.10) rather than upgrading Node.js
- Maintain ES module configuration (`"type": "module"`, `vite.config.mts`)
- Use tsx for TypeScript server execution without compilation

**Outcome**: Successful project completion with proper TypeScript conventions maintained and both servers running correctly.

**Key Lesson**: Stop immediately when encountering version compatibility errors and research proper solutions rather than modifying established conventions.