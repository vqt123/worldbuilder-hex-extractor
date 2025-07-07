# Quickstart - Claude Code

Welcome to Claude Code!

This quickstart guide will have you using AI-powered coding assistance in just a few minutes. By the end, you'll understand how to use Claude Code for common development tasks.

## Before you begin

Make sure you have:
- [Installed Claude Code](/en/docs/claude-code/setup)
- A terminal or command prompt open
- A code project to work with

## Step 1: Start your first session

Open your terminal in any project directory and start Claude Code:

```bash
cd /path/to/your/project
claude
```

You'll see the Claude Code prompt inside a new interactive session:

```
✻ Welcome to Claude Code!

...

> Try "create a util logging.py that..." 
```

## Step 2: Ask your first question

Let's start with understanding your codebase. Try one of these commands:

```
> what does this project do?
```

Claude will analyze your files and provide a summary. You can also ask more specific questions:

```
> what technologies does this project use?
> where is the main entry point?
> explain the folder structure
```

> Claude Code reads your files as needed - you don't have to manually add context.

## Step 3: Make your first code change

Now let's make Claude Code do some actual coding. Try a simple task:

```
> add a hello world function to the main file
```

Claude Code will:
1. Find the appropriate file
2. Show you the proposed changes
3. Ask for your approval
4. Make the edit

> Claude Code always asks for permission before modifying files. You can approve individual changes or enable "Accept all" mode for a session.

## Step 4: Use Git with Claude Code

Claude Code makes Git operations conversational:

```
> what files have I changed?
> commit my changes with a descriptive message
```

You can also prompt for more complex Git operations:

```
> create a new branch called feature/quickstart
> show me the last 5 commits
> help me resolve merge conflicts
```

## Step 5: Fix a bug or