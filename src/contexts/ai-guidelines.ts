import type { ContextFile } from '../types/context';

export const aiGuidelinesContexts: ContextFile[] = [
  {
    id: 'ai-efficiency-patterns',
    name: 'AI Efficiency Patterns',
    description: 'Specific patterns for AI assistants to maximize EFP MCP efficiency',
    category: 'ai-guidelines',
    content: `# AI Efficiency Patterns for EFP MCP

## Primary Rule: Always Use Efficient Tag Querying

When a user asks for "tagged users" or "everyone someone has tagged":

### ✅ ALWAYS DO THIS:
1. Call \`fetchFollowingTags\` first to get available tags
2. Call \`getFollowing\` with ALL tags in the tags parameter
3. This guarantees you get ALL tagged users in ~2 seconds

### ❌ NEVER DO THIS:
- Don't fetch entire following lists and filter locally
- Don't make multiple separate calls for each tag
- Don't use pagination to get "all" results

### Code Pattern:
\`\`\`typescript
// Step 1: Get available tags
const tags = await fetchFollowingTags(user);
// Step 2: Get all tagged users efficiently  
const taggedUsers = await getFollowing(user, { tags: allTagNames, limit: 100 });
\`\`\`

## Tool Selection Decision Matrix

### When User Asks About Follower Counts:
- **"How many followers?"** → Use \`getFollowerCount\`
- **"Detailed stats" or "live data"** → Use \`fetchProfileStats\` with \`isLive: true\`
- **"Compare multiple users"** → Use \`fetchProfileStats\` for each

### When User Asks About Following Lists:
- **"Who follows X?"** → Use \`getFollowers\`
- **"Who does X follow?"** → Use \`getFollowing\`
- **"Show tagged users"** → Use efficient tag pattern
- **"Search for someone in following"** → Use \`getFollowing\` with search parameter

### When User Asks About Relationships:
- **"Does A follow B?"** → Use \`checkFollower\` (user-level)
- **"Does list X follow Y?"** → Use \`checkFollowing\` (list-level)
- **"Detailed relationship info"** → Use \`fetchFollowState\`

## Performance Optimization Rules

### Response Time Targets:
- **<1 second:** Basic counts, simple checks
- **1-3 seconds:** Filtered lists, profile stats
- **3-5 seconds:** Complex queries, leaderboards

### Parameter Optimization:
- **Small queries (<20 results):** Use default limits
- **Medium queries (20-100 results):** Set appropriate limit
- **Large queries (>100 results):** Use pagination with pageParam

### Memory Efficiency:
- Use \`limit\` parameter to control response size
- Use pagination for large datasets
- Use \`isLive: true\` only when real-time data is needed

## Common User Intent Patterns

### "Show me everyone X has tagged":
**Recognized phrases:** "tagged users", "everyone tagged", "all tags", "categorized following"
**Action:** Use efficient tag querying pattern

### "Who are the top users?":
**Recognized phrases:** "leaderboard", "most followers", "top influencers", "popular users"
**Action:** Use \`fetchLeaderboard\`

### "Get recommendations":
**Recognized phrases:** "who should I follow", "discover users", "recommendations", "suggested profiles"
**Action:** Use \`fetchRecommendations\` with appropriate endpoint

### "Check if A follows B":
**Recognized phrases:** "does X follow Y", "following relationship", "check connection"
**Action:** Use \`checkFollower\` for user-level relationships

## Error Recovery Patterns

### ENS Name Issues:
1. If user provides name without .eth, try adding .eth suffix
2. If still fails, suggest checking ENS name spelling
3. Offer to search for similar names

### No Results Found:
1. Verify the ENS name is correct
2. Check if user has public EFP lists
3. Suggest trying different search terms
4. Offer alternatives like checking follower counts first

### API Timeouts:
1. Retry with smaller limit parameters
2. Use pagination instead of large single requests
3. Suggest breaking complex queries into smaller parts

## Multi-Step Workflow Optimization

### Complex User Analysis:
1. Start with basic stats (\`fetchProfileStats\`)
2. Get tag overview (\`fetchFollowingTags\`)
3. Get tagged users efficiently (\`getFollowing\` with tags)
4. Add detailed info as needed

### Network Discovery:
1. Get recommendations (\`fetchRecommendations\`)
2. For interesting users, get their top tagged follows
3. Check mutual connections between users
4. Build relationship maps

### Comparative Analysis:
1. Get stats for all users being compared
2. Use consistent parameters across calls
3. Present results in structured format
4. Highlight key differences

## Response Formatting Guidelines

### For Tagged Users:
Always show tags in brackets after user names:
\`\`\`
brantly.eth has tagged 8 people:
1. vitalik.eth [ethereum, top8]
2. jesse.xyz [top8]
3. broke.eth [based]
\`\`\`

### For Relationship Checks:
Be clear about the direction and type:
- "vitalik.eth follows brantly.eth" (user-level)
- "List 6509 follows brantly.eth" (list-level)
- "Blocked" or "Not Following" when applicable

### For Statistics:
Include both followers and following:
- "vitalik.eth has 4,800 followers and 10 following"
- Add context like "(live data)" when using isLive: true

## Advanced Patterns

### Batch Operations:
When user asks about multiple users, batch the requests efficiently:
1. Collect all user identifiers
2. Make parallel calls when possible
3. Handle errors gracefully for each user
4. Present results in organized format

### Caching Awareness:
- Profile stats are cached for ~5 minutes
- ENS resolutions are cached
- Use fresh: true only for critical verification
- Explain data freshness when relevant

### Context Integration:
When users ask about "how to do X":
1. Search these usage contexts first
2. Provide specific patterns and examples
3. Explain why certain approaches are better
4. Reference performance implications`,
    mimeType: 'text/markdown',
    tags: ['ai-guidelines', 'efficiency', 'patterns', 'optimization', 'decision-trees']
  },
  {
    id: 'troubleshooting-patterns',
    name: 'Troubleshooting Patterns',
    description: 'Common issues and systematic solutions for AI assistants',
    category: 'ai-guidelines',
    content: `# Troubleshooting Patterns for AI Assistants

## Systematic Error Resolution

### Step 1: Identify Error Type
- **Parameter Error:** Missing or invalid parameters
- **Data Error:** User not found, no results
- **API Error:** Server issues, timeouts
- **Format Error:** Invalid ENS names, addresses

### Step 2: Apply Appropriate Fix
Each error type has specific resolution patterns.

## Parameter Error Patterns

### Missing Required Parameters:
**Error:** "Error: addressOrName is required"
**Fix:** Always validate required parameters before making calls
**Prevention:** Check tool definitions for required vs optional parameters

### Invalid Parameter Values:
**Error:** "Error: Invalid ENS name"
**Fixes:**
1. Add .eth suffix if missing
2. Check for typos in ENS name
3. Try with Ethereum address instead
4. Validate address format

### Code Pattern:
\`\`\`typescript
// Always validate before calling
if (!addressOrName) {
  return "Please provide an ENS name or Ethereum address";
}

// Try with .eth suffix if needed
if (!addressOrName.includes('.') && !addressOrName.startsWith('0x')) {
  addressOrName = addressOrName + '.eth';
}
\`\`\`

## Data Error Patterns

### No Results Found:
**Common scenarios:**
- User has no public EFP lists
- User has no followers/following
- Search terms don't match

**Resolution steps:**
1. Verify ENS name exists and is correct
2. Check basic profile stats first
3. Try broader search terms
4. Explain why no results might occur

### Empty Tag Results:
**Scenario:** User asks for tagged users but none exist
**Response pattern:**
"X doesn't have any tagged users in their following list. They follow Y people but haven't categorized them with tags."

## API Error Patterns

### Timeout Errors:
**Causes:** Large requests, server load
**Fixes:**
1. Reduce limit parameter
2. Use pagination instead of large single requests
3. Retry with simpler query
4. Break complex requests into smaller parts

### Rate Limiting:
**Symptoms:** Repeated failures, slow responses
**Fixes:**
1. Add small delays between requests
2. Batch similar requests
3. Use cached data when available
4. Reduce concurrent requests

## Format Error Patterns

### ENS Name Format Issues:
**Common problems:**
- Missing .eth suffix
- Typos in name
- Using display name instead of ENS name

**Systematic fixes:**
\`\`\`typescript
function normalizeENSName(input: string): string {
  // Remove whitespace
  input = input.trim().toLowerCase();
  
  // Add .eth if it looks like an ENS name
  if (!input.includes('.') && !input.startsWith('0x')) {
    input = input + '.eth';
  }
  
  return input;
}
\`\`\`

### Address Format Issues:
**Problems:** Invalid checksum, wrong length
**Fixes:**
1. Validate address format before using
2. Try ENS resolution if address fails
3. Suggest user double-check the address

## Performance Troubleshooting

### Slow Response Times:
**Diagnosis steps:**
1. Check if using efficient patterns
2. Verify parameter sizes (limits, pagination)
3. Confirm not using wasteful approaches

**Common fixes:**
- Use tag pattern instead of full list filtering
- Reduce limit parameters for large queries
- Use pagination for extensive data

### Memory Issues:
**Symptoms:** Large response payloads, timeouts
**Fixes:**
1. Implement proper pagination
2. Use appropriate limit values
3. Process data in chunks
4. Use targeted queries instead of broad sweeps

## User Experience Patterns

### When Errors Occur:
1. **Explain what went wrong** in simple terms
2. **Suggest specific fixes** the user can try
3. **Offer alternatives** if main approach fails
4. **Provide context** about why error occurred

### Example Error Response:
\`\`\`
I couldn't find "vitalik" - it looks like this ENS name is incomplete. 

Try these options:
1. "vitalik.eth" (with .eth suffix)
2. Use the full Ethereum address if you have it
3. Check the spelling of the ENS name

Would you like me to search for ENS names containing "vitalik"?
\`\`\`

## Debugging Workflow

### For Tool Failures:
1. **Log the exact error** received
2. **Check parameter validity** 
3. **Try simpler version** of the same query
4. **Use alternative tools** if available
5. **Explain what's happening** to the user

### For Data Issues:
1. **Verify user exists** with basic profile check
2. **Check data availability** (public lists, etc.)
3. **Try different approaches** (different tools)
4. **Provide helpful context** about EFP system

### For Performance Issues:
1. **Identify bottlenecks** (large requests, complex queries)
2. **Optimize parameters** (limits, pagination)
3. **Use efficient patterns** (tag querying, etc.)
4. **Break down complex requests**

## Prevention Strategies

### Input Validation:
- Always normalize ENS names
- Validate addresses before use
- Check for required parameters
- Provide helpful parameter defaults

### Query Optimization:
- Use efficient patterns by default
- Start with simple queries, add complexity gradually
- Leverage caching when appropriate
- Monitor response times and adjust

### User Education:
- Explain why certain patterns are better
- Show performance differences when relevant
- Teach users about EFP system limitations
- Provide tips for better results

## Common Issue Resolution Map

| User Request | Potential Issues | Resolution Pattern |
|--------------|------------------|-------------------|
| "Show tagged users" | No tags exist | Use efficient tag pattern, explain if empty |
| "Check if A follows B" | Invalid names | Normalize names, use checkFollower |
| "Get followers list" | Large list | Use pagination, appropriate limits |
| "User stats" | User not found | Verify ENS name, try alternatives |
| "Search following" | No matches | Try broader terms, check spelling |

This systematic approach ensures consistent, helpful error resolution that improves user experience while maintaining optimal performance.`,
    mimeType: 'text/markdown',
    tags: ['troubleshooting', 'error-handling', 'debugging', 'user-experience', 'ai-guidelines']
  }
];