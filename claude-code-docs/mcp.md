# Model Context Protocol (MCP)

Model Context Protocol (MCP) is an open protocol that enables LLMs to access external tools and data sources. For more details about MCP, see the [MCP documentation](https://modelcontextprotocol.io/introduction).

> Use third party MCP servers at your own risk. Make sure you trust the MCP servers, and be especially careful when using MCP servers that talk to the internet, as these can expose you to prompt injection risk.

## Configure MCP Servers

### Add an MCP stdio Server

```bash
# Basic syntax
claude mcp add <name> <command> [args...]

# Example: Adding a local server
claude mcp add my-server -e API_KEY=123 -- /path/to/server arg1 arg2
```

### Add an MCP SSE Server

```bash
# Basic syntax
claude mcp add --transport sse <name> <url>

# Example: Adding an SSE server
claude mcp add --transport sse sse-server https://example.com/sse-endpoint

# Example: Adding an SSE server with custom headers
claude mcp add --transport sse api-server https://api.example.com/mcp --header "X-API-Key: your-key"
```

### Add an MCP HTTP Server

```bash
# Basic syntax
claude mcp add --transport http <name> <url>

# Example: Adding a streamable HTTP server
claude mcp add --transport http http-server https://example.com/mcp

# Example: Adding an HTTP server with authentication header
claude mcp add --transport http secure-server https://api.example.com/mcp --header "Authorization: Bearer your-token"
```

### Manage MCP Servers

```bash
# List all configured servers
claude mcp list

# Get details for a specific server
claude mcp get my-server

# Remove a server
claude mcp remove my-server
```

### Tips

- Use `-s` or `--scope` flag to specify configuration storage
- Set environment variables with `-e` or `--env` flags