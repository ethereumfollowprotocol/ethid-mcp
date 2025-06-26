# Using EthFollow MCP with Claude Code

This guide explains how to deploy and use the EthFollow MCP server with Claude Code for querying follower relationships and accessing comprehensive protocol documentation.

## Quick Start

### 1. Deploy the MCP Server

The MCP server is already deployed and available at: `https://efp-mcp.efp.workers.dev`

To deploy your own instance:

```bash
# Install dependencies
npm install

# Deploy to Cloudflare
npm run deploy
```

### 2. Configure Claude Code

In Claude Code, add the MCP server:

```bash
# Add the EthFollow MCP server
claude mcp add --transport http efp-mcp https://efp-mcp.efp.workers.dev
```

### 3. Start Using

Now you can ask Claude questions that will use your EthFollow MCP!

## What You Can Ask

### EthFollow API Queries

Ask about follower relationships:

```
"How many followers does brantly.eth have?"
"Does encrypteddegen.eth follow tahubucat.eth?"
"Show me the first 10 followers of vitalik.eth"
"Who is ens.eth following?"
"List 5 people that brantly.eth follows"
"Get recommendations for accounts to follow"
"Show me the top 10 users by follower count"
"Search for ENS names containing 'ethereum'"
```

### Protocol Documentation Access

Access comprehensive documentation:

```
"What is the Ethereum Follow Protocol?"
"Explain how EFP List NFTs work"
"Show me the ENS reverse registrar documentation"
"How do I implement Sign-In with Ethereum?"
"What are the different roles in an EFP List?"
```

### Search Within Documentation

Search through large documentation files:

```
"Search for 'primary list' in the EFP documentation"
"Find information about DNSSEC in the ENS docs"
"Search for authentication examples in SIWE docs"
"Look for gas costs in the EFP documentation"
```

### Get Specific Sections

Access targeted sections of documentation:

```
"Show me the EFP NFT section"
"Get the ENS DNS registrar documentation"
"Show me the SIWE quickstart guide"
"Explain EFP tags from the documentation"
```

## Available Resources

### EthFollow API Tools
- **getFollowerCount**: Get follower count for an ENS name
- **checkFollowing**: Check if one ENS follows another
- **getFollowers**: List followers of an ENS name
- **getFollowing**: List who an ENS name follows
- **getRecommendations**: Get recommended profiles to follow
- **getLeaderboard**: Get top users by follower count
- **searchENS**: Search for ENS names

### Documentation Access Tools
- **searchFileContext**: Search within specific large files
- **getFileMetadata**: Get file information and available sections
- **getFileSection**: Access specific documentation sections
- **searchContexts**: Search across all context files

### Available Documentation

#### Complete Protocol Docs (75K+ lines total):
- **EFP** (`efp`): Ethereum Follow Protocol (9K lines)
- **EIK** (`eik`): Ethereum Identity Kit - aggregated docs (40K lines)
- **ENS** (`ens`): Ethereum Name Service (22K lines)
- **SIWE** (`siwe`): Sign-In with Ethereum (3K lines)

#### Context Categories:
- **General**: Overview, getting started, FAQs
- **Technical**: API docs, architecture, deployment
- **Business**: Domain knowledge, use cases, glossary
- **Protocols**: Complete technical documentation

## Example Conversations

### Basic EthFollow Queries

**You:** "How many followers does brantly.eth have?"

**Claude:** *Uses getFollowerCount tool*
"brantly.eth has 1,247 followers"

**You:** "Does vitalik.eth follow brantly.eth?"

**Claude:** *Uses checkFollowing tool*
"Yes, vitalik.eth follows brantly.eth"

### Documentation Access

**You:** "What is an EFP List NFT?"

**Claude:** *Accesses EFP documentation*
"An EFP List NFT is a non-fungible token that represents ownership of an EFP List. When you mint an EFP List NFT, you create an EFP List that can store following relationships..."

**You:** "Show me technical details about EFP NFT roles"

**Claude:** *Uses getFileSection('efp', 'nft')*
"Here are the technical details about EFP List NFT roles:

Every EFP List has three roles:
1. **Owner**: Is the owner of the EFP List NFT..."

### Advanced Documentation Search

**You:** "Search for information about gas costs in the EFP docs"

**Claude:** *Uses searchFileContext('efp', 'gas')*
"I found several mentions of gas costs in the EFP documentation:

Lines 65-67: 'Minting an EFP List NFT is free (plus gas)'
Lines 156-158: 'Each operation requires gas fees for blockchain transactions'..."

**You:** "What sections are available in the ENS documentation?"

**Claude:** *Uses getFileMetadata('ens')*
"The ENS documentation contains 22,453 lines and has the following sections:
- reverse-registrar: Primary names and reverse resolution
- dns-registrar: DNS integration and DNSSEC
- manager: ENS management functions
- subgraph: GraphQL queries
- web: Web-based operations
- resolution: Name resolution process
- registration: Domain registration"

## Advanced Usage

### Combining Tools

You can ask complex questions that use multiple tools:

**You:** "Who follows brantly.eth and what does the EFP documentation say about follower relationships?"

**Claude:** Will:
1. Use `getFollowers` to get brantly.eth's followers
2. Access EFP documentation about follower relationships
3. Provide a comprehensive answer

### Context-Aware Queries

The MCP provides context automatically:

**You:** "How do I implement following in my app?"

**Claude:** Will access relevant sections from:
- EFP implementation guides
- API documentation
- Code examples
- Best practices

### Development Queries

**You:** "Show me the EFP API endpoints and how to use them"

**Claude:** Will combine:
- Technical documentation from EFP docs
- API implementation details
- Code examples and best practices

## Configuration Options

### Environment Variables

In your `wrangler.jsonc`:

```json
{
  "vars": {
    "EFP_API_URL": "https://api.ethfollow.xyz"
  }
}
```

### API Endpoints Used

The MCP server uses these EthFollow API endpoints:

```
GET /api/v1/users/{ensName}/stats - Get follower/following counts
GET /api/v1/following/check?follower={follower}&following={following} - Check following relationship
GET /api/v1/users/{ensName}/followers?limit={limit} - Get followers list
GET /api/v1/users/{ensName}/following?limit={limit} - Get following list
GET /api/v1/users/{ensName}/recommended?limit={limit} - Get recommendations
GET /api/v1/discover?limit={limit} - Get general recommendations
GET /api/v1/leaderboard/ranked?limit={limit} - Get leaderboard
GET /api/v1/leaderboard/search?limit={limit}&term={search} - Search leaderboard
```

ENS search uses The Graph's ENS subgraph:
```
POST https://api.thegraph.com/subgraphs/name/ensdomains/ens
```

## Troubleshooting

### MCP Server Issues

```bash
# Check deployment status
npx wrangler tail efp-mcp

# Test the server directly
curl https://efp-mcp.efp.workers.dev
```

### Claude Code Configuration

```bash
# List configured MCP servers
claude mcp list

# Remove and re-add if needed
claude mcp remove efp-mcp
claude mcp add --transport http efp-mcp https://efp-mcp.efp.workers.dev
```

### Common Issues

1. **"Context not found"**: The file contexts may not be loading
   - Check that files exist in `src/contexts/files/`
   - Verify section markers in protocol configs

2. **"API request failed"**: EthFollow API issues
   - Update API endpoints in `api-client.ts`
   - Check environment variables

3. **"Tool not available"**: MCP server not connected
   - Verify deployment succeeded
   - Check Claude Code MCP configuration

## Performance Notes

- Large documentation files are cached after first access
- Sections are extracted on-demand for faster responses
- Search results are limited to prevent timeouts
- File metadata is cached for quick access

## Testing the MCP

You can test all available tools:

```bash
# List available MCP servers
claude mcp list

# Test with actual queries in Claude Code:
# "How many followers does vitalik.eth have?"
# "Search for 'authentication' in the SIWE documentation"
# "Show me the top 5 users by follower count"
# "What sections are available in the EFP documentation?"
```

## Available Tools Summary

**API Tools (7):**
- getFollowerCount - Get follower counts
- checkFollowing - Check follow relationships  
- getFollowers - List followers
- getFollowing - List following
- getRecommendations - Get recommended accounts
- getLeaderboard - Get top users
- searchENS - Search ENS names

**Context Tools (4):**
- searchFileContext - Search within specific docs (efp, eik, ens, siwe)
- getFileMetadata - Get file info and sections
- getFileSection - Get specific documentation sections
- searchContexts - Search across all contexts

## Getting Help

1. Check the deployment logs: `npx wrangler tail efp-mcp`
2. Review the documentation in this repo
3. Test individual tools using Claude Code's MCP inspector
4. Verify your API endpoints are correctly configured

The MCP provides comprehensive access to both real-time EthFollow data and extensive protocol documentation, making it a powerful tool for understanding and working with the Ethereum identity stack.