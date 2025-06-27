# EFP MCP Server Setup Guide

## Quick Setup for Claude Desktop

To use the EFP MCP server with Claude Desktop, add this configuration to your Claude Desktop settings:

### Method 1: Using Supergateway (Recommended)

Add this to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "efp-mcp": {
      "command": "supergateway",
      "args": ["--sse", "https://efp-mcp.efp.workers.dev"]
    }
  }
}
```

**Note:** You'll need to install supergateway globally first:
```bash
npm install -g supergateway
```

### Method 2: Using npx (No global install)

If you prefer not to install globally:

```json
{
  "mcpServers": {
    "efp-mcp": {
      "command": "bash",
      "args": ["-c", "npx -y supergateway --sse https://efp-mcp.efp.workers.dev"]
    }
  }
}
```

### Method 3: Direct node execution

Alternative configuration without external packages:

```json
{
  "mcpServers": {
    "efp-mcp": {
      "command": "node",
      "args": [
        "-e",
        "const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js'); const { Server } = require('@modelcontextprotocol/sdk/server/index.js'); const server = new Server({ name: 'efp-proxy', version: '1.0.0' }, { capabilities: { tools: {} } }); server.setRequestHandler(require('@modelcontextprotocol/sdk/types.js').ListToolsRequestSchema, async () => { const resp = await fetch('https://efp-mcp.efp.workers.dev/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }) }); const data = await resp.json(); return data.result; }); server.setRequestHandler(require('@modelcontextprotocol/sdk/types.js').CallToolRequestSchema, async (request) => { const resp = await fetch('https://efp-mcp.efp.workers.dev/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: request.params }) }); const data = await resp.json(); return data.result; }); const transport = new SSEServerTransport('/tmp/mcp-efp', server); transport.start();"
      ]
    }
  }
}
```

### Method 4: Direct Configuration (Claude Desktop UI)

1. First install supergateway: `npm install -g supergateway`
2. Open Claude Desktop
3. Go to Settings (⌘,)
4. Click on "MCP Servers" tab
5. Add a new server with these details:

**Server Name:** `efp-mcp`
**Command:** `supergateway`
**Arguments:** `--sse https://efp-mcp.efp.workers.dev`

## Verification

After setup, restart Claude Desktop and verify the connection by asking:

> "How many followers does vitalik.eth have?"

You should see Claude use the `getFollowerCount` tool from the EFP MCP server.

## Tool Discovery for Claude Code

### Current Status
Claude Code can see the tool definitions but may have connection issues with the HTTP MCP server. 

### Workaround
If you get OAuth errors, use this approach:

> "Check /tools/list in efp-mcp to see available tools, then use getFollowerCount for vitalik.eth"

### Direct API Alternative
You can also use the API directly:
```bash
curl -X POST https://efp-mcp.efp.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"getFollowerCount","arguments":{"addressOrName":"vitalik.eth"}}}'
```

This helps Claude discover all 25 available tools in the EFP MCP server.

## Available Tools (25 Total)

### Core API Tools (21)
- `getFollowerCount` - Get follower/following count
- `getFollowers` - Get list of followers with filters
- `getFollowing` - Get list of following with filters  
- `checkFollowing` - Check if one list follows another
- `checkFollower` - Check if address follows another
- `fetchAccount` - Get account info with ENS data
- `fetchProfileStats` - Get detailed profile statistics
- `fetchProfileLists` - Get EFP lists owned by address
- `fetchProfileBadges` - Get POAP badges
- `fetchProfileQRCode` - Get QR code for profile
- `fetchProfileFollowing` - Advanced following with filters
- `fetchProfileFollowers` - Advanced followers with filters
- `fetchFollowingTags` - Get tags for following
- `fetchFollowerTags` - Get tags for followers
- `fetchFollowState` - Get follow state between addresses
- `fetchNotifications` - Get user notifications
- `fetchRecommendations` - Get recommended profiles
- `fetchLeaderboard` - Get top users by followers
- `fetchPoapLink` - Get POAP link
- `fetchListState` - Export EFP list state

### Context Tools (1)
- `searchContexts` - Search across all documentation and protocols

### AI Helper Tools (4)
- `getBestPractices` - Get best practices for scenarios
- `getUsagePattern` - Get optimal usage patterns
- `getToolGuidance` - Get guidance on tool selection
- `getEfficiencyTips` - Get performance optimization tips

## Quick Test Commands

Once configured, try these commands to test functionality:

```
How many followers does vitalik.eth have?
```

```
Show me everyone brantly.eth has tagged
```

```
What's the efficient pattern for getting all tagged users?
```

## Troubleshooting

### Tools Not Available
- Ensure Claude Desktop is restarted after configuration
- Check that the server URL is reachable: https://efp-mcp.efp.workers.dev
- Verify MCP server configuration in Claude Desktop settings

### NPM Package Errors
If you see errors like "404 Not Found - @anthropic-ai/mcp-server-http":
- Use the updated configuration with `supergateway` instead
- Make sure you're using Method 1 (Supergateway) from this guide
- The old `@anthropic-ai/mcp-server-http` package doesn't exist

### NPX Command Errors
If you see "ERROR: You must supply a command" from npx:
- Try Method 1 (install supergateway globally) instead of npx
- Or use Method 2 (bash wrapper) which handles npx correctly
- The issue is with how Claude Desktop passes arguments to npx

### Network Issues
- Check internet connection
- Verify firewall/proxy settings allow connections to efp.workers.dev

### Configuration Issues
- Ensure JSON syntax is valid in configuration files
- Check that the server name matches exactly
- Restart Claude Desktop after any configuration changes

## Support

For issues with the EFP MCP server:
- Server Status: https://efp-mcp.efp.workers.dev (should return server info)
- Documentation: See USAGE_GUIDE.md in this repository
- Issues: Create GitHub issue with details

## Advanced Usage

Once connected, the AI helper tools will automatically guide you to optimal usage patterns. For example:

```
getUsagePattern('tagged-users')
```

Returns the efficient pattern for retrieving all tagged users (96% performance improvement over naive approaches).

The server includes comprehensive self-teaching capabilities that help AI assistants discover and apply optimal patterns automatically.