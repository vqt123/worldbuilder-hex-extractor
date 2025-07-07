# CLI reference

Complete reference for Claude Code command-line interface, including commands and flags.

## CLI commands

| Command | Description | Example |
|---------|-------------|---------|
| `claude` | Start interactive REPL | `claude` |
| `claude "query"` | Start REPL with initial prompt | `claude "explain this project"` |
| `claude -p "query"` | Query via SDK, then exit | `claude -p "explain this function"` |
| `cat file \| claude -p "query"` | Process piped content | `cat logs.txt \| claude -p "explain"` |
| `claude -c` | Continue most recent conversation | `claude -c` |
| `claude -c -p "query"` | Continue via SDK | `claude -c -p "Check for type errors"` |
| `claude -r "<session-id>" "query"` | Resume session by ID | `claude -r "abc123" "Finish this PR"` |
| `claude update` | Update to latest version | `claude update` |
| `claude mcp` | Configure Model Context Protocol (MCP) servers | See [Claude Code MCP documentation](/en/docs/claude-code/mcp) |

## CLI flags

Customize Claude Code's behavior with these command-line flags:

| Flag | Description | Example |
|------|-------------|---------|
| `--add-dir` | Add additional working directories for Claude to access | `claude --add-dir ../apps ../lib` |
| `--allowedTools` | List of tools allowed without user permission | `"Bash(git log:*)" "Bash(git diff:*)" "Read"` |
| `--disallowedTools` | List of tools disallowed without user permission | `"Bash(git log:*)" "Bash(git diff:*)" "Edit"` |
| `--print`, `-p` | Print response without interactive mode | `claude -p "query"` |
| `--output-format` | Specify output format for print mode | `claude -p "query" --output-format json` |
| `--input