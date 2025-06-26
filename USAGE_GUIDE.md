# The Ultimate EFP MCP Usage Guide

The most comprehensive guide for using the Ethereum Follow Protocol MCP server. This guide ensures both developers and AI assistants can leverage the full power of the EFP ecosystem efficiently.

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

```
"How many followers does brantly.eth have?"
"Does encrypteddegen.eth follow tahubucat.eth?"
"Show me everyone efp.encrypteddegen.eth has tagged"
"Get vitalik.eth's top8 tagged followers"
```

## Complete Tool Reference

### Basic Query Tools

#### getFollowerCount
Get follower and following counts for any address or ENS name.

**Parameters:**
- `addressOrName` (required): ENS name or Ethereum address

**Example:**
```
"How many followers does vitalik.eth have?"
```

**Response:** `vitalik.eth has 4800 followers and 10 following`

#### getFollowers
List followers with advanced filtering and search capabilities.

**Parameters:**
- `addressOrName` (required): Target address/ENS
- `limit` (optional): Number of results (default: 10)
- `tags` (optional): Array of tags to filter by
- `search` (optional): Search term for ENS names
- `sort` (optional): "earliest first", "latest first", "follower count"

**Examples:**
```
"Show me the first 20 followers of brantly.eth"
"Get followers of vitalik.eth tagged with 'ethereum'"
"Search for followers of ens.eth containing 'crypto'"
```

#### getFollowing
List who someone follows with the same filtering options as getFollowers.

**Advanced Usage:**
```
"Show me everyone brantly.eth follows tagged with 'top8'"
"Get efp.eth's following sorted by follower count"
```

### Relationship Checking Tools

#### checkFollowing
Check if a specific EFP list follows an address.

**Parameters:**
- `list` (required): List ID number
- `following` (required): Address/ENS being checked

**Example:**
```
"Does list 6509 follow brantly.eth?"
```

**Response:** `List 6509 is following brantly.eth` or `List 6509 is not following brantly.eth`

#### checkFollower
Check if one address follows another at the user level.

**Parameters:**
- `addressOrName` (required): Target address/ENS
- `follower` (required): Potential follower address/ENS

**Example:**
```
"Does vitalik.eth follow brantly.eth?"
```

**Response:** `Following`, `Not Following`, or `Blocked`

### Profile Information Tools

#### fetchAccount
Get complete account information including ENS data.

**Parameters:**
- `addressOrName` (required): Address or ENS name

**Returns:** Complete profile data with ENS name, avatar, and metadata.

#### fetchProfileStats
Get detailed statistics with optional live data.

**Parameters:**
- `addressOrName` (required): Target address/ENS
- `list` (optional): Specific list ID
- `isLive` (optional): Get real-time data (boolean)

**Example:**
```
"Get live stats for vitalik.eth"
```

#### fetchProfileLists
Get all EFP lists owned by an address.

**Example Output:**
```
Profile lists for vitalik.eth:
Primary list: 6509
Lists:
List 6509
List 6510
```

#### fetchProfileBadges
Get POAP badges for a profile.

#### fetchProfileQRCode
Generate QR code for a profile.

### Advanced Query Tools

#### fetchProfileFollowing
Advanced following query with pagination and comprehensive filtering.

**Parameters:**
- `addressOrName` (required): Target address/ENS
- `limit` (optional): Results per page
- `pageParam` (optional): Page number
- `tags` (optional): Tag filters
- `search` (optional): Search term
- `sort` (optional): Sort method

#### fetchProfileFollowers
Advanced followers query with same parameters as fetchProfileFollowing.

### Tag Management Tools

#### fetchFollowingTags
Get tag statistics for accounts being followed.

**Example:**
```
"What tags does brantly.eth use?"
```

**Response:**
```
Following tags for brantly.eth:
top8: 8
cool: 1
noob: 2
wife: 1
```

#### fetchFollowerTags
Get tag statistics for followers.

### Discovery & Social Tools

#### fetchRecommendations
Get profile recommendations.

**Parameters:**
- `endpoint` (required): "discover" or "recommended"
- `addressOrName` (optional): For personalized recommendations
- `limit` (optional): Number of results

**Examples:**
```
"Get 10 recommended profiles to follow"
"Show me discovery profiles"
```

#### fetchLeaderboard
Get top users by follower count.

**Parameters:**
- `limit` (optional): Number of results
- `pageParam` (optional): Page number

**Example:**
```
"Show me the top 10 users by follower count"
```

#### fetchNotifications
Get notifications with time filtering.

**Parameters:**
- `addressOrName` (required): Target address/ENS
- `hoursAgo` (optional): Time range in hours

### Specialized Tools

#### fetchFollowState
Get detailed follow state between two addresses.

#### fetchPoapLink
Get POAP claim link for an address.

#### fetchListState
Export complete list state for backup/analysis.

#### fetchListsForUser
Get primary list and all lists for a user.

## Advanced Usage Patterns

### 🚀 Efficient Tag Querying (Best Practice)

**The Pattern:** To get all tagged users efficiently:

1. First, get all available tags:
```
"What tags does efp.encrypteddegen.eth use?"
```

2. Then, get all tagged users at once:
```
"Show me everyone efp.encrypteddegen.eth has tagged"
```

**Why This Works:** The MCP automatically uses `fetchFollowingTags` to get available tags, then calls `getFollowing` with all tags as parameters. This is much more efficient than fetching the entire following list and filtering.

**Implementation:**
```json
{
  "name": "getFollowing",
  "arguments": {
    "addressOrName": "efp.encrypteddegen.eth",
    "tags": ["bff", "top8", "based", "irl", "fren", "friend", "ethereum"],
    "limit": 50
  }
}
```

### Multi-Step Workflows

#### Complete User Analysis
```
1. "Get live stats for vitalik.eth"
2. "Show me vitalik.eth's top8 tagged followers"
3. "What tags does vitalik.eth use for following?"
4. "Get vitalik.eth's primary list information"
```

#### Relationship Investigation
```
1. "Does brantly.eth follow vitalik.eth?"
2. "Get brantly.eth's following list tagged with 'top8'"
3. "Show me mutual followers between brantly.eth and vitalik.eth"
```

### Data Freshness Strategies

**Use `isLive: true` for:**
- Real-time statistics
- Current follower counts
- Live relationship checks

**Use `fresh: true` for:**
- Blockchain-verified data
- Critical relationship verification
- Audit trails

### Pagination Best Practices

**Small Queries (< 50 results):** Use single limit parameter
```json
{ "limit": 20 }
```

**Large Queries (> 50 results):** Use pagination
```json
{ "limit": 50, "pageParam": 1 }
```

**Get All Results:** Use allResults flag (use sparingly)
```json
{ "allResults": true }
```

## AI Assistant Guidelines

### Tool Selection Decision Tree

#### For Follower Counts:
- **Basic counts:** Use `getFollowerCount`
- **Detailed stats:** Use `fetchProfileStats`
- **Live data needed:** Use `fetchProfileStats` with `isLive: true`

#### For Following Lists:
- **Simple list:** Use `getFollowing`
- **With filtering:** Use `getFollowing` with tags/search
- **Advanced pagination:** Use `fetchProfileFollowing`
- **All tagged users:** Use the efficient tag pattern

#### For Relationship Checks:
- **User-level following:** Use `checkFollower`
- **List-level following:** Use `checkFollowing`
- **Detailed relationship:** Use `fetchFollowState`

### Efficient Query Patterns

#### Getting Tagged Users (BEST PRACTICE):
```
1. Ask: "What tags does X use?" → fetchFollowingTags
2. Use all tags in: getFollowing with tags parameter
```

#### User Discovery:
```
1. Get recommendations → fetchRecommendations
2. Get leaderboard → fetchLeaderboard
3. Search by criteria → Use appropriate filters
```

#### Profile Analysis:
```
1. Basic info → fetchAccount
2. Statistics → fetchProfileStats (with isLive if needed)
3. Lists → fetchProfileLists
4. Badges → fetchProfileBadges
```

### Error Handling

**Common Responses:**
- `"Following"` / `"Not Following"` / `"Blocked"` - Relationship status
- `"Error: addressOrName is required"` - Missing parameter
- `"Error: Invalid ENS name"` - Bad input format

**Fallback Strategies:**
1. If ENS name fails, try with .eth suffix
2. If address fails, try ENS resolution
3. If live data fails, try without isLive flag

## Real-World Examples

### Complete Conversation Flows

#### Discovering Tag Patterns
**User:** "Show me everyone efp.encrypteddegen.eth has tagged"

**AI Process:**
1. Use `fetchFollowingTags` to get available tags
2. Use `getFollowing` with all tags as filter
3. Format response showing users with their tags

**Result:**
```
efp.encrypteddegen.eth has tagged 11 people:
1. vitalik.eth [ethereum, top8]
2. brantly.eth [based, irl, top8]
3. jesse.xyz [top8]
4. efp.eth [top8]
5. 0xthrpw.eth [friend, top8]
6. broke.eth [based]
7. raffy.eth [top8]
8. caveman.eth [fren, top8]
9. nike-air-jordan.eth [friend]
10. snxambassador.eth [bff]
11. joobid.eth [based]
```

#### Relationship Investigation
**User:** "Does vitalik.eth follow brantly.eth and what tags does brantly have?"

**AI Process:**
1. Use `checkFollower` for relationship check
2. Use `getFollowing` with search for brantly in vitalik's list
3. Use `fetchFollowingTags` for brantly's tags

#### Community Analysis
**User:** "Who are the top influencers and who do they follow?"

**AI Process:**
1. Use `fetchLeaderboard` for top users
2. For each user, use `getFollowing` with top8 tag
3. Use `fetchProfileStats` for detailed metrics

### Performance Examples

#### Fast Tag Query (Recommended):
```
Time: ~2 seconds
Steps: fetchFollowingTags → getFollowing with tags
Result: All tagged users with their tags
```

#### Slow Tag Query (Avoid):
```
Time: ~10 seconds
Steps: getFollowing(limit: 200) → filter locally
Result: Same data but much slower
```

## Performance & Efficiency Guide

### Response Time Optimization

**Fastest Queries (<1s):**
- `getFollowerCount`
- `checkFollower`
- `checkFollowing`

**Medium Queries (1-3s):**
- `getFollowing` with filters
- `fetchProfileStats`
- `fetchRecommendations`

**Slower Queries (3-5s):**
- Large pagination requests
- `fetchLeaderboard`
- `allResults: true` queries

### Memory-Efficient Patterns

**Use Pagination For:**
- Lists > 50 items
- Leaderboard queries
- Large following lists

**Use Limits For:**
- Quick samples
- Top N results
- Preview data

### Caching Considerations

**Cached by MCP:**
- ENS name resolutions
- Account data
- Profile statistics (5 min cache)

**Always Fresh:**
- Live statistics (`isLive: true`)
- Real-time relationship checks
- Fresh blockchain data (`fresh: true`)

## Troubleshooting & Common Patterns

### Common Issues & Solutions

#### "Context not found"
**Problem:** Documentation context not loading
**Solution:** 
- Check that files exist in `src/contexts/files/`
- Verify section markers in protocol configs
- Restart MCP server

#### "Tool not available"
**Problem:** MCP server not connected
**Solution:**
```bash
# Check connection
claude mcp list

# Re-add server
claude mcp remove efp-mcp
claude mcp add --transport http efp-mcp https://efp-mcp.efp.workers.dev
```

#### "API request failed"
**Problem:** EthFollow API issues
**Solution:**
- Check if ENS name needs .eth suffix
- Try with Ethereum address instead
- Use fresh: false for cached data

#### Empty Results
**Problem:** No followers/following found
**Solution:**
- Verify ENS name is correct
- Check if user has public lists
- Try different search terms

### Debugging Workflows

#### Test Basic Connectivity:
```bash
curl https://efp-mcp.efp.workers.dev
```

#### Test Specific Tool:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "getFollowerCount",
    "arguments": {"addressOrName": "vitalik.eth"}
  }
}
```

#### Check Deployment:
```bash
npx wrangler tail efp-mcp
```

### Common Patterns

#### Pattern 1: User Discovery
```
1. Get recommendations → Find interesting users
2. Check their followers → Understand their network
3. Get their tags → See their categorization
4. Follow relationship checks → Verify connections
```

#### Pattern 2: Network Analysis
```
1. Get user's following list → See who they follow
2. For each followed user → Get their stats
3. Identify mutual connections → Find common networks
4. Analyze tag patterns → Understand categorization
```

#### Pattern 3: Tag Investigation
```
1. Get all tags used → fetchFollowingTags
2. Get users by tag → getFollowing with tag filters
3. Cross-reference tags → Find patterns
4. Analyze relationships → Understand connections
```

## Configuration & Deployment

### Environment Variables

In your `wrangler.jsonc`:

```json
{
  "vars": {
    "EFP_API_URL": "https://api.ethfollow.xyz/api/v1"
  }
}
```

### API Endpoints Used

The MCP server uses these EthFollow API endpoints:

```
GET /api/v1/users/{addressOrName}/stats - Get follower/following counts
GET /api/v1/users/{addressOrName}/followers - Get followers list
GET /api/v1/users/{addressOrName}/following - Get following list
GET /api/v1/users/{addressOrName}/searchFollowing - Search following
GET /api/v1/users/{addressOrName}/tags/following - Get following tags
GET /api/v1/following/check - Check following relationship
GET /api/v1/leaderboard/ranked - Get leaderboard
GET /api/v1/discover - Get discovery recommendations
POST https://api.thegraph.com/subgraphs/name/ensdomains/ens - ENS search
```

### Testing the MCP

You can test all available tools:

```bash
# List available MCP servers
claude mcp list

# Test with queries in Claude Code:
# "How many followers does vitalik.eth have?"
# "Show me everyone brantly.eth has tagged"
# "Get the top 5 users by follower count"
```

## Complete Tools Summary

### API Tools (21 Total)

**Basic Queries (3):**
- `getFollowerCount` - Get follower/following counts
- `getFollowers` - List followers with filtering
- `getFollowing` - List following with filtering

**Relationship Checks (2):**
- `checkFollowing` - Check list-level following
- `checkFollower` - Check user-level following

**Profile Data (5):**
- `fetchAccount` - Complete account data
- `fetchProfileStats` - Detailed statistics
- `fetchProfileLists` - All owned lists
- `fetchProfileBadges` - POAP badges
- `fetchProfileQRCode` - Generate QR code

**Advanced Queries (2):**
- `fetchProfileFollowing` - Advanced following query
- `fetchProfileFollowers` - Advanced followers query

**Tag Management (2):**
- `fetchFollowingTags` - Following tag statistics
- `fetchFollowerTags` - Follower tag statistics

**Discovery (3):**
- `fetchRecommendations` - Get recommendations
- `fetchLeaderboard` - Top users by followers
- `fetchNotifications` - User notifications

**Specialized (4):**
- `fetchFollowState` - Detailed follow state
- `fetchPoapLink` - POAP claim links
- `fetchListState` - Export list state
- `fetchListsForUser` - Get user's lists

### Context Tools (4)

**Documentation Access:**
- `searchFileContext` - Search within docs (efp, eik, ens, siwe)
- `getFileMetadata` - Get file info and sections
- `getFileSection` - Get specific documentation sections
- `searchContexts` - Search across all contexts

## Getting Help

1. **Check deployment:** `npx wrangler tail efp-mcp`
2. **Test connectivity:** `curl https://efp-mcp.efp.workers.dev`
3. **Review logs:** Check Cloudflare Workers dashboard
4. **Verify config:** Check Claude Code MCP settings
5. **Test tools:** Use individual tool calls for debugging

## Best Practices Summary

### For Developers:
- Use the efficient tag querying pattern
- Implement proper pagination for large datasets
- Handle ENS resolution gracefully
- Cache frequently accessed data appropriately

### For AI Assistants:
- Always use the tag pattern for getting all tagged users
- Choose the right tool for the specific use case
- Handle errors gracefully with fallback strategies
- Provide context about data freshness when relevant

### For Performance:
- Use pagination for large queries
- Limit results appropriately
- Use live data only when necessary
- Batch related queries when possible

This guide provides everything needed to effectively use the EthFollow MCP server, ensuring efficient and comprehensive access to the EthFollow Protocol ecosystem.