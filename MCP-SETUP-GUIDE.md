# EFP MCP Server Setup Guide

## Quick Setup for Claude Desktop

To use the EFP MCP server with Claude Desktop, add this configuration to your Claude Desktop settings:

### Method 1: Configure via Claude Desktop Settings

1. Open Claude Desktop
2. Go to Settings (⌘,)
3. Click on "MCP Servers" tab
4. Add a new server with these details:

**Server Name:** `efp-mcp`
**Server URL:** `https://efp-mcp.efp.workers.dev`
**Server Type:** `HTTP`

### Method 2: Direct JSON Configuration

Add this to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "efp-mcp": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-http", "https://efp-mcp.efp.workers.dev"]
    }
  }
}
```

### Method 3: Local Configuration File

If using a configuration file, create/edit `~/.claude/mcp_servers.json`:

```json
{
  "mcpServers": {
    "efp-mcp": {
      "command": "node",
      "args": ["-e", "require('@anthropic-ai/mcp-server-http').startServer('https://efp-mcp.efp.workers.dev')"]
    }
  }
}
```

## Verification

After setup, restart Claude Desktop and verify the connection by asking:

> "How many followers does vitalik.eth have?"

You should see Claude use the `getFollowerCount` tool from the EFP MCP server.

## Available Tools (28 Total)

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

### Context Tools (4)
- `searchContexts` - Search across all documentation
- `searchFileContext` - Search within specific context files
- `getFileMetadata` - Get metadata about context files
- `getFileSection` - Get specific sections from context files

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