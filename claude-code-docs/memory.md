# Manage Claude's memory

Claude Code can remember your preferences across sessions, like style guidelines and common commands in your workflow.

## Determine memory type

Claude Code offers three memory locations, each serving a different purpose:

| Memory Type | Location | Purpose | Use Case Examples |
|------------|----------|---------|-------------------|
| **Project memory** | `./CLAUDE.md` | Team-shared instructions for the project | Project architecture, coding standards, common workflows |
| **User memory** | `~/.claude/CLAUDE.md` | Personal preferences for all projects | Code styling preferences, personal tooling shortcuts |
| **Project memory (local)** | `./CLAUDE.local.md` | **(Deprecated)** Personal project-specific preferences | Your sandbox URLs, preferred test data |

All memory files are automatically loaded into Claude Code's context when launched.

## CLAUDE.md imports

CLAUDE.md files can import additional files using `@path/to/import` syntax. The following example imports 3 files:

```
See @README for project overview and @package.json for available npm commands for this project.

# Additional Instructions
- git workflow @docs/git-instructions.md
```

Both relative and absolute paths are allowed. Importing files in the user's home directory is a convenient way for team members to provide individual instructions not checked into the repository.

To avoid potential collisions, imports are not evaluated inside markdown code spans and code blocks.

```
This code span will not be treated as an import: `@anthropic-ai/claude-code`
```

Imported files can recursively import additional files, with a max-depth of 5 hops. You can see what memory files are loaded by running `/memory` command.

## How Claude looks up memories

Claude Code reads memories recursively: starting in the current working directory, it recurses up to (but not including) the root directory `/` and reads any CLAUDE.md or CLAUDE.local.md files it finds.

Claude will also discover CLAUDE.md nested in subtrees under your current working directory. Instead of loading them at launch, they are only included when Claude reads files in those subtrees.

## Quickly add memories with the `#` shortcut