# EthFollow MCP Server

An MCP (Model Context Protocol) server that integrates with ethfollow.xyz API to query follower relationships on Ethereum Name Service (ENS).

## Features

### Tools
- **getFollowerCount**: Get the number of followers for an ENS name
- **checkFollowing**: Check if one ENS name follows another
- **getFollowers**: Get a list of followers for an ENS name
- **getFollowing**: Get a list of accounts an ENS name is following

### Resources
- Context files that provide information about the API and available functions
- Automatically included in conversations to provide context

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Update `wrangler.jsonc` with your API endpoint:
```json
{
  "vars": { 
    "ETHFOLLOW_API_URL": "https://api.ethfollow.xyz"
  }
}
```

If your API requires authentication, add:
```json
{
  "vars": { 
    "ETHFOLLOW_API_URL": "https://api.ethfollow.xyz",
    "ETHFOLLOW_API_KEY": "your-api-key"
  }
}
```

### 3. Update API Endpoints
Replace the placeholder endpoints in `src/utils/api-client.ts` with your actual ethfollow.xyz API endpoints:
- `/followers/count/{ensName}`
- `/following/check?follower={follower}&following={following}`
- `/followers/{ensName}?limit={limit}`
- `/following/{ensName}?limit={limit}`

### 4. Deploy
```bash
npm run deploy
```

## Development

Run locally:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

## Project Structure
```
efp-mcp/
├── src/
│   ├── index.ts          # Main MCP server
│   ├── context/          # Context files
│   │   ├── README.md     # General context
│   │   └── api-guide.md  # API documentation
│   ├── types/            # TypeScript types
│   │   └── api.ts        # API response types
│   └── utils/            # Utilities
│       └── api-client.ts # API client
├── wrangler.jsonc        # Cloudflare Worker config
└── package.json
```

## Usage Examples

Once deployed, the MCP server can answer queries like:
- "How many followers does brantly.eth have?"
- "Does encrypteddegen.eth follow tahubucat.eth?"
- "Show me the first 20 followers of vitalik.eth"
- "Who is ens.eth following?"

## Context System

The server includes a flexible context management system that automatically provides relevant information to the LLM.

### Built-in Contexts

Contexts are organized into categories:
- **General**: Overview, getting started guides, FAQs
- **Technical**: API documentation, architecture, deployment
- **Business**: Domain knowledge, use cases, glossary
- **Protocols**: Complete documentation for EFP, ENS, SIWE (large files)

### Features
- Dynamic context loading from multiple sources
- Category and tag-based organization
- Context search functionality
- Large file support with section-based access
- Easy addition of new contexts

### Large Protocol Documentation

The server includes comprehensive documentation for:
- **EFP Complete** (9K+ lines): Full Ethereum Follow Protocol docs
- **EIK Complete** (40K+ lines): Aggregated Ethereum Identity context
- **ENS Complete** (22K+ lines): Complete Ethereum Name Service docs  
- **SIWE Complete** (3K+ lines): Sign-In with Ethereum documentation

These can be accessed as:
- Full documents: `context://efp-full`
- Specific sections: `context://efp-full#nft`
- Search within: Use `searchFileContext` tool

### Tools for Large Contexts

- **searchFileContext**: Search within specific documentation
- **getFileMetadata**: Get file size and available sections
- **getFileSection**: Access specific documentation sections

### Adding New Contexts
See [ADDING_CONTEXTS.md](./ADDING_CONTEXTS.md) for detailed instructions.

Quick examples:
```typescript
// Small context (embedded)
{
  id: 'my-context',
  name: 'My Context', 
  content: 'Your content...',
  tags: ['relevant', 'tags']
}

// Large file context
{
  id: 'my-docs',
  filename: 'my-large-file.txt',
  sections: { 'intro': { startMarker: '# Introduction' } }
}
```

## Error Handling

The API client includes error handling for:
- Network failures
- Invalid responses
- API errors

Errors are returned as part of the tool response rather than throwing exceptions.