# EthFollow Protocol MCP Server

An MCP (Model Context Protocol) server that provides comprehensive access to the Ethereum Follow Protocol (EFP) API, enabling social graph queries for Ethereum addresses and ENS names.

## Features

### Core Tools (26 Total)
- **Basic Operations**: `getFollowerCount`, `getFollowers`, `getFollowing`, `checkFollowing`, `checkFollower`
- **Profile Data**: `fetchAccount`, `fetchProfileStats`, `fetchProfileLists`, `fetchProfileBadges`, `fetchProfileQRCode`
- **Advanced Queries**: `fetchProfileFollowing`, `fetchProfileFollowers` with pagination and filtering
- **Tag Management**: `fetchFollowingTags`, `fetchFollowerTags` (limited availability)
- **Social Features**: `fetchFollowState`, `fetchNotifications`, `fetchRecommendations`, `fetchLeaderboard`
- **List Operations**: `fetchListState`, `fetchListsForUser`, `fetchPoapLink`
- **Help & Guidance**: `searchContexts`, `getBestPractices`, `getUsagePattern`, `getToolGuidance`, `getEfficiencyTips`

### Key Capabilities
- **Tag Filtering**: Filter followers/following by tags (e.g., "top8", "friend", "family")
- **ENS Resolution**: Automatic resolution of ENS names to addresses
- **Pagination Support**: Handle large datasets efficiently
- **Search Functionality**: Search within followers/following lists
- **Real-time Data**: Option to fetch fresh data bypassing cache

## Setup

### For Claude Desktop Users

See [MCP-SETUP-GUIDE.md](./MCP-SETUP-GUIDE.md) for detailed Claude Desktop configuration.

### For Developers

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Deploy to Cloudflare Workers**
   ```bash
   npm run deploy
   ```

3. **Configure Claude Desktop**
   Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "efp-mcp": {
         "command": "/path/to/efp-mcp/run-workers-mcp.sh",
         "args": ["node", "/path/to/efp-mcp/local-mcp-server.mjs"]
       }
     }
   }
   ```

## Usage

See [USAGE_GUIDE.md](./USAGE_GUIDE.md) for comprehensive examples and best practices.

### Quick Examples

```typescript
// Get follower count
await getFollowerCount({ addressOrName: "vitalik.eth" })
// Result: "vitalik.eth has 4811 followers and is following 10 accounts."

// Check who someone follows with tags
await getFollowing({ 
  addressOrName: "efp.encrypteddegen.eth",
  tags: ["top8"]
})
// Result: List of top 8 friends with their addresses and tags

// Get profile information
await fetchAccount({ addressOrName: "brantly.eth" })
// Result: Complete profile with ENS records, avatar, social links
```

## Project Structure
```
efp-mcp/
├── src/
│   ├── index.ts              # Main worker implementation
│   ├── index-workers-mcp.ts  # MCP-compatible wrapper
│   ├── types/                # TypeScript types
│   └── utils/                # API client and utilities
├── local-mcp-server.mjs      # Local MCP proxy server
├── run-workers-mcp.sh        # Node.js compatibility wrapper
├── wrangler.json             # Cloudflare Worker config
├── MCP-SETUP-GUIDE.md        # Claude Desktop setup
└── USAGE_GUIDE.md            # Comprehensive usage guide
```

## Architecture

The EFP MCP server operates as a Cloudflare Worker that:
1. Receives MCP requests via the local proxy server
2. Calls the EFP API at `https://api.ethfollow.xyz/api/v1`
3. Returns formatted responses optimized for AI consumption

### Key Components

- **Cloudflare Worker**: Main API integration and business logic
- **Local MCP Server**: Proxy for Claude Desktop integration
- **Node.js Wrapper**: Compatibility layer for Node.js v22.12.0+

## Contributing

The project is actively maintained and welcomes contributions. The current deployment is fully functional with 25/26 tools working correctly.

## License

See [LICENSE](./LICENSE) for details.