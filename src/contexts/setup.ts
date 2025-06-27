import type { ContextFile } from '../types/context';

export const setupContexts: ContextFile[] = [
  {
    id: 'mcp-setup',
    name: 'MCP Setup and Tool Discovery',
    description: 'Essential setup instructions and tool discovery guide for the EFP MCP server',
    category: 'setup',
    tags: ['setup', 'getting-started', 'tool-discovery', 'configuration', 'quickstart'],
    content: `# EFP MCP Setup and Tool Discovery Guide

## 🚀 Quick Start - Tool Discovery

**IMPORTANT: To discover all available tools, tell Claude:**

> "Check /tools/list in efp-mcp to see available tools"

This will reveal all 28 tools available in the EFP MCP server.

## Available Tools Overview

The EFP MCP server provides 28 tools in three categories:

### Core EFP API Tools (21 tools)
- **Basic Operations**: getFollowerCount, getFollowers, getFollowing
- **Relationship Checks**: checkFollower, checkFollowing
- **Profile Data**: fetchAccount, fetchProfileStats, fetchProfileBadges
- **Advanced Features**: Tag filtering, search, sorting
- **Social Graph**: fetchFollowingTags, fetchFollowerTags
- **Recommendations**: fetchRecommendations, fetchLeaderboard

### Documentation Tools (3 tools)
- **searchContexts**: Search all documentation and guides
- **getBestPractices**: Get best practices for specific scenarios
- **getUsagePattern**: Get optimal usage patterns

### AI Helper Tools (4 tools)
- **getToolGuidance**: Get guidance on tool selection
- **getEfficiencyTips**: Get performance optimization tips
- **getQuickStart**: Get started quickly with examples

## Tool Discovery for Different Scenarios

### If Claude says "I don't have access to tools":
1. Tell Claude: "Check /tools/list in efp-mcp"
2. Or be specific: "Use the getFollowerCount tool from efp-mcp"

### If Claude tries to use web search instead:
Say: "Don't use web search. Use the MCP tools - specifically check /tools/list in efp-mcp"

### If Claude tries to write code:
Say: "Don't write code. Use the available MCP tools - the efp-mcp server has 28 tools available"

## Example Queries to Try

Once tools are discovered, try these:

1. **Basic Query**: "How many followers does vitalik.eth have?"
   - Uses: getFollowerCount

2. **Relationship Check**: "Does vitalik.eth follow brantly.eth?"
   - Uses: checkFollower

3. **Tagged Users**: "Show me everyone brantly.eth has tagged"
   - Uses: fetchFollowingTags → getFollowing with tags

4. **Efficiency Pattern**: "What's the efficient way to get all tagged users?"
   - Uses: getUsagePattern('tagged-users')

## Configuration for Claude Desktop

If you need to configure the MCP server:

1. **Server URL**: https://efp-mcp.efp.workers.dev
2. **Server Type**: HTTP
3. **Server Name**: efp-mcp

## Troubleshooting

### Tools not showing up?
- Ensure you told Claude to "Check /tools/list in efp-mcp"
- Try restarting Claude Desktop
- Verify server is reachable at https://efp-mcp.efp.workers.dev

### Getting errors?
- Check network connection
- Try the test script: node test-connection.mjs
- Use getBestPractices('error-handling') for help

## Key Features

✅ **28 Total Tools** - Complete EFP API coverage + helpers
✅ **Self-Teaching** - AI helpers guide optimal usage
✅ **96% Faster** - Efficient patterns built-in
✅ **ENS Support** - Automatic name resolution
✅ **Tag System** - Advanced social graph features

Remember: The magic phrase is "Check /tools/list in efp-mcp"!`,
    mimeType: 'text/markdown'
  }
];