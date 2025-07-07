# Add Claude Code to your IDE

Claude Code seamlessly integrates with popular Integrated Development Environments (IDEs) to enhance your coding workflow. This integration allows you to leverage Claude's capabilities directly within your preferred development environment.

## Supported IDEs

Claude Code currently supports two major IDE families:

- **Visual Studio Code** (including popular forks like Cursor and Windsurf)
- **JetBrains IDEs** (including PyCharm, WebStorm, IntelliJ, and GoLand)

## Features

- **Quick launch**: Use `Cmd+Esc` (Mac) or `Ctrl+Esc` (Windows/Linux) to open Claude Code directly from your editor, or click the Claude Code button in the UI
- **Diff viewing**: Code changes can be displayed directly in the IDE diff viewer instead of the terminal. You can configure this in `/config`
- **Selection context**: The current selection/tab in the IDE is automatically shared with Claude Code
- **File reference shortcuts**: Use `Cmd+Option+K` (Mac) or `Alt+Ctrl+K` (Linux/Windows) to insert file references (e.g., @File#L1-99)
- **Diagnostic sharing**: Diagnostic errors (lint, syntax, etc.) from the IDE are automatically shared with Claude as you work

## Installation

### VS Code

1. Open VSCode
2. Open the integrated terminal
3. Run `claude` - the extension will auto-install

Going forward you can also use the `/ide` command in any external terminal to connect to the IDE.

> These installation instructions also apply to VS Code forks like Cursor and Windsurf.

### JetBrains IDEs

Install the [Claude Code plugin](https://docs.anthropic.com/s/claude-code-jetbrains) from the marketplace and restart your IDE.

> The plugin may also be auto-installed when you run `claude` in the integrated terminal. The IDE must be restarted completely to take effect.

**Remote Development Limitations**: When using JetBrains Remote Development, you must install the plugin in the remote host via `Settings > Plugin (Host)`.

## Configuration

Both integrations work