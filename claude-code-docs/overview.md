# Claude Code overview

By integrating directly with your development environment, Claude Code streamlines your workflow without requiring additional servers or complex setup.

## Basic usage

To install Claude Code, use NPM:

```bash
npm install -g @anthropic-ai/claude-code
```

For more detailed installation instructions, see [Set up Claude Code](/en/docs/claude-code/setup).

To run Claude Code, simply call the `claude` CLI:

```bash
claude
```

You can then prompt Claude directly from the interactive Claude Code REPL session.

For more usage instructions, see [Quickstart](/en/docs/claude-code/quickstart).

## Why Claude Code?

### Accelerate development

Use Claude Code to accelerate development with the following key capabilities:

- Editing files and fixing bugs across your codebase
- Answering questions about your code's architecture and logic
- Executing and fixing tests, linting, and other commands
- Searching through git history, resolving merge conflicts, and creating commits and PRs
- Browsing documentation and resources from the internet using web search

Claude Code provides a comprehensive set of [tools](/en/docs/claude-code/settings#tools-available-to-claude) for interacting with your development environment, including file operations, code search, web browsing, and more.

### Security and privacy by design

Your code's security is paramount. Claude Code's architecture ensures:

- **Direct API connection**: Your queries go straight to Anthropic's API without intermediate servers
- **Works where you work**: Operates directly in your terminal
- **Understands context**: Maintains awareness of your entire project structure
- **Takes action**: Performs real operations like editing files and creating commits

### Enterprise integration

Claude Code seamlessly integrates with enterprise AI platforms. You can connect to [Amazon Bedrock or Google Vertex AI](/en/docs/claude-code/third-party-integrations) for secure, compliant deployments that meet your organization's requirements.

## Next steps

[Setup](/en/docs/claude-code/setup) | [Quickstart](/en/docs/claude-code/quickstart) | [Commands](/en/docs/claude-code/cli-reference) |