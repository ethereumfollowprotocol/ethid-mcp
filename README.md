# EthFollow Protocol MCP Server

An MCP (Model Context Protocol) server that provides comprehensive access to the Ethereum Follow Protocol (EFP) API, enabling social graph queries for Ethereum addresses and ENS names.

## Features

### Core Tools (22 Total)

- **Basic Operations**: `getFollowerCount`, `getFollowers`, `getFollowing`, `checkFollowing`, `checkFollower`
- **Profile Data**: `fetchAccount`, `fetchProfileStats`, `fetchProfileLists`, `fetchProfileBadges`, `fetchProfileQRCode`
- **Advanced Queries**: `fetchProfileFollowing`, `fetchProfileFollowers` with pagination and filtering
- **Tag Management**: `fetchFollowingTags`, `fetchFollowerTags` (limited availability)
- **Social Features**: `fetchFollowState`, `fetchNotifications`, `fetchRecommendations`, `fetchLeaderboard`
- **List Operations**: `fetchListState`, `fetchListsForUser`, `fetchPoapLink`
- **ENS Resolution**: `fetchBulkAccounts` - Bulk reverse resolution of addresses to ENS names
- **Help & Guidance**: `searchContexts`, `getBestPractices`, `getUsagePattern`, `getToolGuidance`, `getEfficiencyTips`

### Key Capabilities

- **Tag Filtering**: Filter followers/following by tags (e.g., "top8", "friend", "family")
- **ENS Resolution**: Automatic resolution of ENS names to addresses
- **Bulk ENS Reverse Resolution**: Convert multiple addresses to ENS names efficiently
- **Pagination Support**: Handle large datasets efficiently
- **Search Functionality**: Search within followers/following lists
- **Real-time Data**: Option to fetch fresh data bypassing cache

## Setup

### For Developers

```json
{
	"mcpServers": {
		"efp-mcp": {
			"command": "npx",
			"args": ["mcp-remote", "https://efp-mcp.efp.workers.dev/sse"]
		}
	}
}
```

## Usage

**🚀 IMPORTANT: Before using the EFP MCP server, run the initialization prompt from [EFP_MCP_INITIALIZATION_PROMPT.md](./EFP_MCP_INITIALIZATION_PROMPT.md) to ensure optimal performance and proper tool usage.**

See [USAGE_GUIDE.md](./USAGE_GUIDE.md) for comprehensive examples and best practices.

### Quick Examples

```typescript
// Get follower count
await getFollowerCount({ addressOrName: 'vitalik.eth' });
// Result: "vitalik.eth has 4811 followers and is following 10 accounts."

// Check who someone follows with tags
await getFollowing({
	addressOrName: 'efp.encrypteddegen.eth',
	tags: ['top8'],
});
// Result: List of top 8 friends with their addresses and tags

// Convert addresses to ENS names
await fetchBulkAccounts({
	addresses: ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', '0x849151d7d0bf1f34b70d5cad5149d28cc2308bf1'],
});
// Result: ["vitalik.eth", "jesse.xyz"]

// Get profile information
await fetchAccount({ addressOrName: 'brantly.eth' });
// Result: Complete profile with ENS records, avatar, social links
```

## Project Structure

```
efp-mcp/
├── src/
│   ├── index.ts              # Main MCP agent implementation
│   ├── tools/                # Modular tool definitions
│   │   ├── index.ts          # Tool registration coordinator
│   │   ├── profile.ts        # Profile and following/followers tools
│   │   ├── account.ts        # Account data and ENS resolution tools
│   │   ├── relationships.ts  # Relationship checking tools
│   │   ├── tags.ts          # Tag management tools
│   │   ├── discovery.ts     # Discovery and recommendation tools
│   │   ├── lists.ts         # List management tools
│   │   ├── context.ts       # Documentation context search
│   │   └── guidance.ts      # Best practices and guidance tools
│   ├── types/                # TypeScript types
│   │   ├── api.ts           # API response types
│   │   └── env.ts           # Environment configuration types
│   ├── contexts/            # Documentation contexts
│   └── utils/               # Utility functions
├── wrangler.json            # Cloudflare Worker config
├── USAGE_GUIDE.md          # Comprehensive usage guide
└── EFP_MCP_INITIALIZATION_PROMPT.md  # Initialization guide
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
