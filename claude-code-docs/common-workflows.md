# Common Workflows

This document covers common workflows and patterns for using Claude Code effectively in your development process.

## Understanding New Codebases

### Getting a quick overview
- Use "what does this project do?" to understand the overall purpose
- Ask "what technologies does this project use?" to understand the stack
- Request "explain the folder structure" to understand the organization

### Finding relevant code
- Use specific queries like "show me the authentication logic"
- Ask "where is the database connection handled?"
- Request "find the main API endpoints"

## Development Workflows

### Fixing bugs efficiently
- Describe the bug and let Claude analyze the issue
- Use "help me debug this error" with error messages
- Ask for step-by-step debugging approaches

### Refactoring code
- Request "help me refactor this function to be more readable"
- Ask for "suggestions to improve this code's performance"
- Use "break this large function into smaller ones"

### Working with tests
- Ask "write tests for this function"
- Request "help me fix these failing tests"
- Use "explain what this test is checking"

### Creating pull requests
- Use "help me create a PR for these changes"
- Ask for "a good commit message for these changes"
- Request "help me write a PR description"

## Advanced Features

### Working with images
- Share screenshots or diagrams for context
- Ask Claude to analyze UI mockups
- Use visual references for implementation guidance

### Using file references
- Reference specific files with @filename syntax
- Use line ranges like @file.py#L10-20
- Reference multiple files in one query

### Extended thinking
- Use complex queries that require multi-step reasoning
- Ask for architectural decisions and trade-offs
- Request detailed explanations of complex topics

## Utility Functions

### Using Claude as a Unix-style utility
- Pipe data to Claude for analysis
- Process log files and data
- Generate reports and summaries

### Creating custom slash commands
- Define frequently-used prompts as markdown files
- Organize commands by scope (project vs personal)
- Use namespacing through directory structures

*Note: For complete documentation, visit the official Anthropic documentation at https://docs.anthropic.com/en/docs/claude-code/common-workflows*