import type { ContextFile } from '../types/context';

export const technicalContexts: ContextFile[] = [
  {
    id: 'api-guide',
    name: 'API Guide',
    description: 'Documentation for ethfollow.xyz API',
    category: 'technical',
    content: `# EthFollow API Integration Guide

## API Endpoints

Replace the placeholder API endpoints in \`src/index.ts\` with your actual ethfollow.xyz API endpoints:

### 1. Get Follower Count
\`\`\`
GET /followers/count/{ensName}
Response: { count: number }
\`\`\`

### 2. Check Following Relationship
\`\`\`
GET /following/check?follower={follower}&following={following}
Response: { isFollowing: boolean }
\`\`\`

### 3. Get Followers List
\`\`\`
GET /followers/{ensName}?limit={limit}
Response: { followers: string[] }
\`\`\`

### 4. Get Following List
\`\`\`
GET /following/{ensName}?limit={limit}
Response: { following: string[] }
\`\`\`

## Configuration

Set the \`ETHFOLLOW_API_URL\` environment variable in your \`wrangler.jsonc\`:

\`\`\`json
{
  "vars": {
    "ETHFOLLOW_API_URL": "https://api.ethfollow.xyz"
  }
}
\`\`\`

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
    tags: ['api', 'technical', 'endpoints']
  },
  {
    id: 'architecture',
    name: 'Architecture Overview',
    description: 'Technical architecture of the EthFollow MCP',
    category: 'technical',
    content: `# EthFollow MCP Architecture

## Components

### 1. MCP Server (index.ts)
- Extends McpAgent from Cloudflare
- Handles tool registration and execution
- Manages context resources

### 2. API Client (utils/api-client.ts)
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
3. API Client → EthFollow API
4. Response → Tool → User

## Extensibility

- Add new tools in index.ts
- Add new contexts in src/contexts/
- Extend API client for new endpoints`,
    mimeType: 'text/markdown',
    tags: ['architecture', 'technical', 'design']
  },
  {
    id: 'deployment',
    name: 'Deployment Guide',
    description: 'How to deploy the EthFollow MCP',
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
- \`ETHFOLLOW_API_URL\`: Custom API endpoint
- \`ETHFOLLOW_API_KEY\`: API authentication key

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
    tags: ['deployment', 'devops', 'production']
  }
];