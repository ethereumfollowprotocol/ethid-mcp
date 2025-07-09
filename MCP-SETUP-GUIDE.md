# EFP MCP Server Setup Guide

## ✅ **STATUS: WORKING** - Public Access Enabled!

**Latest Update**: The deployed cloud server (efp-mcp.efp.workers.dev) is now fully open with no authentication required. All 25 EFP tools are publicly accessible.

## Quick Setup for Claude Desktop

### Method 1: Local MCP Server with Node.js Wrapper (RECOMMENDED) ✅

This uses your existing Node.js wrapper but connects to a local server with all 25 tools:

**Step 1:** Make sure your wrapper script is executable:

```bash
chmod +x /Users/janzunec/Documents/GitHub/efp-mcp/run-workers-mcp.sh
```

**Step 2:** Update your Claude Desktop MCP configuration to use the local server:

```json
{
	"mcpServers": {
		"efp-mcp": {
			"command": "/Users/janzunec/.nvm/versions/node/v22.12.0/bin/node",
			"args": ["/[PATH_TO_MCP]/efp-mcp/local-mcp-server.mjs"]
		}
	}
}
```

**Benefits:**

- ✅ Uses your existing Node.js v22.12.0 setup
- ✅ Local server = no network dependencies
- ✅ All 25 EFP tools available
- ✅ Direct API access to https://api.ethfollow.xyz
- ✅ Compatible with Claude Desktop

---

### Method 2: Local MCP Server (Alternative)

If you prefer a simple local server approach:

```json
{
	"mcpServers": {
		"efp-mcp": {
			"command": "node",
			"args": ["/Users/janzunec/Documents/GitHub/efp-mcp/local-mcp-server.mjs"]
		}
	}
}
```

**Benefits:** Simple, direct, 4 core tools (getFollowerCount, getFollowers, getFollowing, searchContexts)

---

### Method 3: Using Supergateway (Cloud Server - Public/Open Access)

Connect to the full cloud server with all 25 tools (no authentication required):

**Step 1:** Install supergateway:

```bash
npm install -g supergateway
```

**Step 2:** Add this to your Claude Desktop MCP configuration:

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

**Benefits:**

- ✅ All 25 tools available
- ✅ Full context search and AI helpers
- ✅ No local setup required
- ✅ Always up-to-date

---

## Verification

After setup, restart Claude Desktop and verify the connection by asking:

> "How many followers does vitalik.eth have?"

You should see Claude use the `getFollowerCount` tool from the EFP MCP server.

## Available Tools

### Local Server (Method 1) - 25 Tools ✅ WORKING

**Core Tools:**

- `getFollowerCount` - Get follower/following count for any address or ENS name
- `getFollowers` - Get list of followers with filtering options
- `getFollowing` - Get list of following with filtering options
- `searchContexts` - Search through EFP documentation

**Advanced Tools (21 additional):**

- Profile analysis: `fetchAccount`, `fetchProfileStats`, `fetchProfileLists`, `fetchProfileBadges`, `fetchProfileQRCode`
- Relationship checking: `checkFollowing`, `checkFollower`, `fetchFollowState`
- Advanced filtering: `fetchProfileFollowing`, `fetchProfileFollowers`
- Tag management: `fetchFollowingTags`, `fetchFollowerTags`
- Discovery: `fetchRecommendations`, `fetchLeaderboard`, `fetchNotifications`
- Utilities: `fetchPoapLink`, `fetchListState`, `fetchListsForUser`
- AI Helpers: `getBestPractices`, `getUsagePattern`, `getToolGuidance`, `getEfficiencyTips`

### Cloud Server (Method 2) - Same 25 Tools

Alternative connection method using supergateway (if local server doesn't work)

- AI helper tools for optimization

## Quick Test Commands

Once configured, try these commands to test functionality:

```
How many followers does vitalik.eth have?
```

```
Show me the first 5 followers of brantly.eth
```

```
Who is vitalik.eth following?
```

## Troubleshooting

### Local Server Issues

- Ensure Node.js v15+ is installed
- Verify the file path in the configuration is correct
- Check that @modelcontextprotocol/sdk and zod are installed globally
- Restart Claude Desktop after configuration changes

### Tools Not Available

- Ensure Claude Desktop is restarted after configuration
- Check the server configuration in Claude Desktop settings
- For cloud server: verify https://efp-mcp.efp.workers.dev is reachable

### Path Issues

If the hardcoded path doesn't work for your system:

1. Navigate to your efp-mcp directory
2. Run `pwd` to get the full path
3. Replace the path in the configuration with: `YOUR_PATH/local-mcp-server.mjs`

## Which Method Should I Use?

**Choose Method 1 (Local Server) if:**

- You want a simple, reliable setup
- You mainly need basic follower/following functionality
- You prefer local tools without network dependencies
- You want to understand how MCP servers work

**Choose Method 2 (Cloud Server) if:**

- You want access to all 25 tools
- You need advanced features like tag management
- You want AI helpers for optimization
- You prefer not to manage local dependencies

## Wrapper Scripts

This repository includes Node.js compatibility wrapper scripts:

- **`run-workers-mcp.sh`**: Ensures workers-mcp runs with Node.js v22.12.0
- **`run-mcp.js`**: Node.js wrapper for workers-mcp commands

These scripts solve Node.js version compatibility issues with the workers-mcp framework.

## Direct Parameter Calling

All methods support direct parameter calling. The cloud server preserves the existing API:

```bash
# Test direct API call (no authentication required)
curl -X POST https://efp-mcp.efp.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"getFollowerCount","arguments":{"addressOrName":"vitalik.eth"}}}'
```

### Test Endpoint

The deployed server also includes a test endpoint:

```bash
# Quick test to verify the server is working
curl https://efp-mcp.efp.workers.dev/test
```

## Support

For issues:

- **Method 1**: Check wrapper script permissions and Node.js path
- **Method 2**: Verify Node.js version and MCP SDK installation
- **Method 3**: Verify network connectivity to efp.workers.dev
- **All methods**: Restart Claude Desktop after configuration changes

The workers-mcp approach provides the most comprehensive toolset with modern framework benefits.

## Developer Notes

### Authentication Architecture

- **Deployed Version** (`src/index.ts`): Open/public access with no authentication required
- **Local Development** (`src/index-workers-mcp.ts`): Uses workers-mcp with built-in Bearer token authentication
- **Why?**: The deployed version is intentionally open for public use, while local development can use authentication for testing

To deploy the open version:

```bash
wrangler deploy  # Uses src/index.ts as configured in wrangler.jsonc
```
