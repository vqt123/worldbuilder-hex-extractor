# Claude Code SDK

The Claude Code SDK provides programmatic access to Claude's AI coding capabilities through command-line, TypeScript, and Python interfaces.

## Overview

The SDK enables developers to integrate Claude Code functionality into their applications, tools, and workflows. It supports both interactive and non-interactive usage patterns, making it suitable for various automation scenarios.

## Key Features

### Multi-language Support
- **Command Line Interface**: Direct CLI access for shell scripts and automation
- **TypeScript/JavaScript**: npm package for Node.js applications
- **Python**: PyPI package for Python applications

### Authentication Methods
- **Anthropic API**: Direct API key authentication
- **Amazon Bedrock**: AWS credentials and IAM-based authentication
- **Google Vertex AI**: GCP service account authentication
- **Third-party providers**: Custom authentication mechanisms

### Conversation Management
- **Non-interactive mode**: Single request-response interactions
- **Multi-turn conversations**: Maintain context across multiple exchanges
- **Session management**: Resume and continue previous conversations

### Advanced Features
- **Custom system prompts**: Tailor Claude's behavior for specific use cases
- **Model Context Protocol (MCP)**: Extend capabilities with custom tools
- **Input/output formats**: Flexible data handling and formatting options
- **Permission management**: Control tool usage and access permissions

## Installation

### TypeScript/JavaScript
```bash
npm install @anthropic-ai/claude-code
```

### Python
```bash
pip install anthropic-claude-code
```

## Basic Usage

### TypeScript Example
```typescript
import { ClaudeCode } from '@anthropic-ai/claude-code';

const claude = new ClaudeCode({
  apiKey: 'your-api-key'
});

const response = await claude.query('Explain this code', {
  files: ['src/main.ts']
});
```

### Python Example
```python
from anthropic_claude_code import ClaudeCode

claude = ClaudeCode(api_key='your-api-key')

response = claude.query('Explain this code', files=['src/main.py'])
```

### CLI Usage
```bash
# Non-interactive query
claude -p "explain this function" --files src/utils.js

# Interactive session
claude --files src/

# Continue previous conversation
claude -c -p "now add error handling"
```

## Configuration

### Environment Variables
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `CLAUDE_CODE_USE_BEDROCK`: Enable Bedrock integration
- `CLAUDE_CODE_USE_VERTEX`: Enable Vertex AI integration
- `CLAUDE_CODE_PROJECT_PATH`: Default project directory

### Settings File
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "systemPrompt": "You are a helpful coding assistant",
  "permissions": {
    "allow": ["Read", "Bash(git*)"],
    "deny": ["Edit"]
  }
}
```

## Advanced Usage

### MCP Integration
```typescript
const claude = new ClaudeCode({
  apiKey: 'your-api-key',
  mcpServers: [
    {
      name: 'database',
      command: 'node',
      args: ['database-mcp-server.js']
    }
  ]
});
```

### Custom Tool Implementation
```typescript
const claude = new ClaudeCode({
  apiKey: 'your-api-key',
  tools: [
    {
      name: 'custom_analyzer',
      description: 'Analyze code complexity',
      implementation: async (input) => {
        // Custom tool logic
        return { complexity: 'high', suggestions: [...] };
      }
    }
  ]
});
```

## Error Handling

### Common Error Types
- **Authentication errors**: Invalid API keys or credentials
- **Rate limiting**: Too many requests in a short period
- **Network errors**: Connection issues or timeouts
- **Permission errors**: Insufficient access to files or directories

### Error Handling Example
```typescript
try {
  const response = await claude.query('analyze this code');
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limiting
    await new Promise(resolve => setTimeout(resolve, 60000));
    // Retry the request
  } else if (error.code === 'AUTHENTICATION_ERROR') {
    // Handle authentication issues
    console.error('Invalid API key');
  }
}
```

## Best Practices

### Performance Optimization
- Use prompt caching for repeated queries
- Implement request batching for multiple operations
- Cache results when appropriate
- Use appropriate model sizes for different tasks

### Security Considerations
- Store API keys securely using environment variables
- Implement proper access controls and permissions
- Validate and sanitize user inputs
- Monitor and log API usage

### Cost Management
- Monitor token usage and costs
- Use cost-effective models when appropriate
- Implement usage limits and alerts
- Cache expensive operations

*Note: For complete API documentation and examples, visit the official Anthropic documentation at https://docs.anthropic.com/en/docs/claude-code/sdk*