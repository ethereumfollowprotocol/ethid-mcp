import type { ContextFile } from '../types/context';

export const usageGuideContexts: ContextFile[] = [
  {
    id: 'usage-patterns',
    name: 'EFP MCP Usage Patterns',
    description: 'Essential usage patterns and best practices for the EFP MCP server',
    category: 'usage-guide',
    content: `# EFP MCP Usage Patterns & Best Practices

## 🚀 Most Important Pattern: Efficient Tag Querying

### THE PATTERN (Use This Always)
To get all tagged users efficiently:

1. **First, get available tags:**
   - Use \`fetchFollowingTags\` to get tag statistics
   - Example: "What tags does brantly.eth use?"

2. **Then, get all tagged users at once:**
   - Use \`getFollowing\` with ALL tags as parameters
   - Example: "Show me everyone brantly.eth has tagged"

### Implementation:
\`\`\`json
{
  "name": "getFollowing",
  "arguments": {
    "addressOrName": "brantly.eth",
    "tags": ["top8", "cool", "noob", "wife"],
    "limit": 50
  }
}
\`\`\`

### Why This Works:
- **5x faster** than fetching full following list and filtering
- **Always complete** - guarantees you get ALL tagged users
- **Efficient** - leverages server-side filtering
- **Accurate** - no missed users due to pagination

### Performance Comparison:
- ✅ **Fast (2 seconds):** fetchFollowingTags → getFollowing with tags
- ❌ **Slow (10 seconds):** getFollowing(limit: 200) → local filtering

## Tool Selection Decision Trees

### For Follower Counts:
- **Basic counts:** Use \`getFollowerCount\`
- **Detailed stats:** Use \`fetchProfileStats\`
- **Live data needed:** Use \`fetchProfileStats\` with \`isLive: true\`

### For Following Lists:
- **Simple list:** Use \`getFollowing\`
- **With filtering:** Use \`getFollowing\` with tags/search
- **Advanced pagination:** Use \`fetchProfileFollowing\`
- **All tagged users:** Use the efficient tag pattern above

### For Relationship Checks:
- **User-level following:** Use \`checkFollower\`
- **List-level following:** Use \`checkFollowing\`
- **Detailed relationship:** Use \`fetchFollowState\`

## Multi-Step Workflows

### Complete User Analysis:
1. "Get live stats for vitalik.eth" → \`fetchProfileStats\` with \`isLive: true\`
2. "What tags does vitalik.eth use?" → \`fetchFollowingTags\`
3. "Show me all tagged users" → \`getFollowing\` with all tags
4. "Get vitalik.eth's primary list" → \`fetchProfileLists\`

### Relationship Investigation:
1. "Does A follow B?" → \`checkFollower\`
2. "Get A's top8 tagged following" → \`getFollowing\` with tags: ["top8"]
3. "Show mutual connections" → Compare following lists

## Response Time Expectations

### Fastest Queries (<1s):
- \`getFollowerCount\`
- \`checkFollower\`
- \`checkFollowing\`

### Medium Queries (1-3s):
- \`getFollowing\` with filters
- \`fetchProfileStats\`
- \`fetchRecommendations\`

### Slower Queries (3-5s):
- Large pagination requests
- \`fetchLeaderboard\`
- \`allResults: true\` queries

## Error Handling Patterns

### Common Responses:
- "Following" / "Not Following" / "Blocked" - Relationship status
- "Error: addressOrName is required" - Missing parameter
- "Error: Invalid ENS name" - Bad input format

### Fallback Strategies:
1. If ENS name fails, try with .eth suffix
2. If address fails, try ENS resolution
3. If live data fails, try without isLive flag

## Parameter Optimization

### Pagination Best Practices:
- **Small queries (<50):** Use single limit parameter
- **Large queries (>50):** Use pagination with pageParam
- **Get all results:** Use allResults flag sparingly

### Data Freshness:
- **Use \`isLive: true\` for:** Real-time stats, current counts, live checks
- **Use \`fresh: true\` for:** Blockchain-verified data, critical verification

### Memory Efficiency:
- **Use pagination for:** Lists >50 items, leaderboard queries
- **Use limits for:** Quick samples, top N results, preview data`,
    mimeType: 'text/markdown',
    tags: ['patterns', 'best-practices', 'efficiency', 'performance', 'ai-guidelines']
  },
  {
    id: 'complete-tool-reference',
    name: 'Complete Tool Reference',
    description: 'Comprehensive reference for all 27 EFP MCP tools with examples',
    category: 'technical',
    content: `# Complete EFP MCP Tool Reference

## Basic Query Tools (3)

### getFollowerCount
Get follower and following counts for any address or ENS name.
- **Parameters:** addressOrName (required)
- **Example:** "How many followers does vitalik.eth have?"
- **Response:** "vitalik.eth has 4800 followers and 10 following"

### getFollowers
List followers with advanced filtering and search.
- **Parameters:** addressOrName (required), limit, tags[], search, sort
- **Examples:** 
  - "Show me the first 20 followers of brantly.eth"
  - "Get followers of vitalik.eth tagged with 'ethereum'"

### getFollowing
List who someone follows with same filtering as getFollowers.
- **Parameters:** addressOrName (required), limit, tags[], search, sort
- **Examples:**
  - "Show me everyone brantly.eth follows tagged with 'top8'"
  - "Get efp.eth's following sorted by follower count"

## Relationship Checking Tools (2)

### checkFollowing
Check if a specific EFP list follows an address.
- **Parameters:** list (required), following (required)
- **Example:** "Does list 6509 follow brantly.eth?"
- **Response:** "List 6509 is following brantly.eth"

### checkFollower
Check if one address follows another at user level.
- **Parameters:** addressOrName (required), follower (required)
- **Example:** "Does vitalik.eth follow brantly.eth?"
- **Response:** "Following", "Not Following", or "Blocked"

## Profile Information Tools (5)

### fetchAccount
Get complete account information including ENS data.
- **Parameters:** addressOrName (required)
- **Returns:** Complete profile with ENS name, avatar, metadata

### fetchProfileStats
Get detailed statistics with optional live data.
- **Parameters:** addressOrName (required), list, isLive
- **Example:** "Get live stats for vitalik.eth"

### fetchProfileLists
Get all EFP lists owned by an address.
- **Example Output:** 
  \`\`\`
  Profile lists for vitalik.eth:
  Primary list: 6509
  Lists: List 6509, List 6510
  \`\`\`

### fetchProfileBadges
Get POAP badges for a profile.

### fetchProfileQRCode
Generate QR code for a profile.

## Advanced Query Tools (2)

### fetchProfileFollowing
Advanced following query with comprehensive filtering.
- **Parameters:** addressOrName, limit, pageParam, tags[], search, sort

### fetchProfileFollowers
Advanced followers query with same parameters as fetchProfileFollowing.

## Tag Management Tools (2)

### fetchFollowingTags
Get tag statistics for accounts being followed.
- **Example:** "What tags does brantly.eth use?"
- **Response:**
  \`\`\`
  Following tags for brantly.eth:
  top8: 8, cool: 1, noob: 2, wife: 1
  \`\`\`

### fetchFollowerTags
Get tag statistics for followers.

## Discovery & Social Tools (3)

### fetchRecommendations
Get profile recommendations.
- **Parameters:** endpoint ("discover"/"recommended"), addressOrName, limit
- **Examples:** "Get 10 recommended profiles", "Show discovery profiles"

### fetchLeaderboard
Get top users by follower count.
- **Parameters:** limit, pageParam
- **Example:** "Show me the top 10 users by follower count"

### fetchNotifications
Get notifications with time filtering.
- **Parameters:** addressOrName (required), hoursAgo

## Specialized Tools (4)

### fetchFollowState
Get detailed follow state between two addresses.

### fetchPoapLink
Get POAP claim link for an address.

### fetchListState
Export complete list state for backup/analysis.

### fetchListsForUser
Get primary list and all lists for a user.

## Context Access Tools (4)

### searchContexts
Search across all available usage contexts and documentation.
- **Parameters:** query (required), category, tags[]

### searchFileContext
Search within specific context files.
- **Parameters:** contextId (required), query (required)

### getFileMetadata
Get metadata about available context files and sections.
- **Parameters:** contextId (required)

### getFileSection
Get specific sections from context files.
- **Parameters:** contextId (required), section (required)`,
    mimeType: 'text/markdown',
    tags: ['reference', 'tools', 'api', 'complete']
  },
  {
    id: 'real-examples',
    name: 'Real Conversation Examples',
    description: 'Real-world conversation flows and usage examples',
    category: 'examples',
    content: `# Real Conversation Examples

## Efficient Tag Discovery

### User Request:
"Show me everyone efp.encrypteddegen.eth has tagged"

### AI Process:
1. Use \`fetchFollowingTags\` to get available tags
2. Use \`getFollowing\` with all tags as filter
3. Format response showing users with their tags

### Result:
\`\`\`
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
\`\`\`

## Relationship Investigation

### User Request:
"Does vitalik.eth follow brantly.eth and what tags does brantly use?"

### AI Process:
1. Use \`checkFollower\` for relationship check
2. Use \`fetchFollowingTags\` for brantly's tags
3. Optionally search vitalik's following for brantly

### Response:
"Yes, vitalik.eth follows brantly.eth. brantly.eth uses these tags: top8 (8 people), cool (1 person), noob (2 people), wife (1 person)."

## Community Analysis

### User Request:
"Who are the top influencers and who do they follow?"

### AI Process:
1. Use \`fetchLeaderboard\` for top users
2. For each user, use \`getFollowing\` with top8 tag
3. Use \`fetchProfileStats\` for detailed metrics

## Performance Comparison Examples

### Efficient Tag Query:
\`\`\`
Time: ~2 seconds
Steps: fetchFollowingTags → getFollowing with tags
Result: All tagged users with their tags
\`\`\`

### Inefficient Tag Query (Don't Do This):
\`\`\`
Time: ~10 seconds
Steps: getFollowing(limit: 200) → filter locally
Result: Same data but much slower
\`\`\`

## Common Error Scenarios

### ENS Name Issues:
- **Input:** "vitalik" (missing .eth)
- **Response:** "Error: Invalid ENS name"
- **Fix:** Try "vitalik.eth"

### Missing Parameters:
- **Input:** checkFollower without follower parameter
- **Response:** "Error: follower is required"
- **Fix:** Include all required parameters

### No Results:
- **Input:** Search for non-existent user
- **Response:** "No followers found"
- **Fix:** Verify ENS name is correct, check if user has public lists

## Multi-Tool Workflows

### Complete User Profile Analysis:
1. "Get vitalik.eth's stats" → \`fetchProfileStats\`
2. "What lists does vitalik.eth own?" → \`fetchProfileLists\`
3. "Who does vitalik.eth follow with top8 tag?" → \`getFollowing\` with tags
4. "Get vitalik.eth's badges" → \`fetchProfileBadges\`

### Network Discovery:
1. "Get recommendations" → \`fetchRecommendations\`
2. "For each recommended user, get their top follows" → \`getFollowing\` with tags
3. "Check mutual connections" → Compare following lists
4. "Get their influence metrics" → \`fetchProfileStats\``,
    mimeType: 'text/markdown',
    tags: ['examples', 'workflows', 'conversations', 'real-world']
  }
];