---
description: Search Claude Code documentation for specific topics
---

# Documentation Search

Search the local Claude Code documentation for information about: $ARGUMENTS

First, let me search through the documentation files to find relevant content.

!find claude-code-docs -name "*.md" -exec grep -l "$ARGUMENTS" {} \;

Now let me read the most relevant documentation files:

@claude-code-docs/overview.md
@claude-code-docs/quickstart.md

Based on your search term "$ARGUMENTS", here are the most relevant documentation sections.