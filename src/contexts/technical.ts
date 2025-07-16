import type { ContextFile } from '../types/context';

export const technicalContexts: ContextFile[] = [
	{
		id: 'api-guide',
		name: 'EFP API Reference',
		description: 'Complete reference for EFP API endpoints and usage',
		category: 'technical',
		content: `# EFP API Integration Guide

## Current API Endpoints

The ETHID MCP server uses these live API endpoints:

### Core API Endpoints (Live)
\`\`\`
GET /api/v1/users/{addressOrName}/stats - Get follower/following counts
GET /api/v1/users/{addressOrName}/followers - Get followers list with filtering
GET /api/v1/users/{addressOrName}/following - Get following list with filtering
GET /api/v1/users/{addressOrName}/searchFollowing - Search following with tags
GET /api/v1/users/{addressOrName}/tags/following - Get following tag statistics
GET /api/v1/following/check - Check following relationship
GET /api/v1/leaderboard/ranked - Get leaderboard by followers
GET /api/v1/discover - Get discovery recommendations
\`\`\`

### Advanced Features Supported
- **Tag filtering**: Filter by multiple tags in following/followers queries
- **Search**: Real-time search within following lists
- **Pagination**: Support for large datasets with pageParam
- **Live data**: Real-time blockchain data with isLive parameter
- **ENS resolution**: Automatic ENS name resolution

## Configuration

Set the \`EFP_API_URL\` environment variable in your \`wrangler.jsonc\`:

\`\`\`json
{
  "vars": {
    "EFP_API_URL": "https://api.ethfollow.xyz/api/v1"
  }
}
\`\`\`

## Available MCP Tools (22 Total)

### API Tools (18):
- Basic queries: getProfileStats, getFollowers, getFollowing
- Relationship checks: checkFollowing, checkFollower, fetchFollowState
- Profile data: fetchAccount, fetchBulkAccounts, fetchProfileLists, fetchProfileBadges
- Tag management: fetchFollowingTags, fetchFollowerTags
- Discovery: fetchNotifications, fetchRecommendations, fetchLeaderboard
- List management: fetchAllFollowings, fetchListsForUser

### Context Tools (1):
- searchContexts: Search across usage contexts

### AI Helper Tools (4):
- getBestPractices: Get best practices for scenarios
- getUsagePattern: Get optimal usage patterns
- getToolGuidance: Get tool selection guidance
- getEfficiencyTips: Get performance optimization tips

## Authentication

If your API requires authentication, add the necessary headers in the fetch calls:

\`\`\`typescript
const response = await fetch(url, {
  headers: {
    'Authorization': \`Bearer \${this.env.API_KEY}\`,
    'Content-Type': 'application/json'
  }
});
\`\`\`

## Error Handling

Consider adding error handling for:
- Invalid ENS names
- Rate limiting
- Network errors
- API downtime

## Response Format

Ensure your API responses match the expected format or update the response parsing in the MCP server accordingly.`,
		mimeType: 'text/markdown',
		tags: ['api', 'technical', 'endpoints'],
	},
	{
		id: 'architecture',
		name: 'Architecture Overview',
		description: 'Technical architecture of the Ethereum Follow Protocol MCP',
		category: 'technical',
		content: `# Ethereum Follow Protocol MCP Architecture

## Components

### 1. MCP Server (index.ts)
- Extends McpAgent from Cloudflare
- Handles tool registration and execution
- Manages context resources

### 2. API Client
- Encapsulates all API interactions
- Handles errors gracefully
- Supports authentication

### 3. Context Manager (utils/context-manager.ts)
- Dynamic context loading
- Category and tag-based organization
- Search functionality

### 4. Type Definitions
- API response types
- Context file interfaces
- Environment configuration

## Data Flow

1. User Query → MCP Tool
2. Tool → API Client
3. API Client → Ethereum Follow Protocol API
4. Response → Tool → User

## Extensibility

- Add new tools in index.ts
- Add new contexts in src/contexts/
- Extend API client for new endpoints`,
		mimeType: 'text/markdown',
		tags: ['architecture', 'technical', 'design'],
	},
	{
		id: 'deployment',
		name: 'Deployment Guide',
		description: 'How to deploy the Ethereum Follow Protocol MCP',
		category: 'technical',
		content: `# Deployment Guide

## Local Development

\`\`\`bash
# Install dependencies
npm install

# Run locally
npm run dev

# Run tests
npm test
\`\`\`

## Production Deployment

\`\`\`bash
# Deploy to Cloudflare Workers
npm run deploy
\`\`\`

## Environment Variables

### Required
- None (uses defaults)

### Optional
- \`EFP_API_URL\`: Custom API endpoint

## Monitoring

1. Check Cloudflare dashboard for:
   - Request metrics
   - Error rates
   - Performance data

2. Enable observability in wrangler.jsonc

## Troubleshooting

### Common Issues
- API endpoint not responding
- Invalid ENS names
- Rate limiting

### Debug Steps
1. Check wrangler logs
2. Verify API endpoints
3. Test with known ENS names`,
		mimeType: 'text/markdown',
		tags: ['deployment', 'devops', 'production'],
	},
];
