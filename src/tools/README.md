# EFP MCP Tools

This directory contains the modular tool definitions for the EFP MCP server, organized by functionality.

## Structure

```
src/tools/
├── index.ts          # Main tool registration coordinator
├── profile.ts        # Profile and following/followers tools
├── account.ts        # Account data and ENS resolution tools
├── relationships.ts  # Relationship checking tools
├── tags.ts          # Tag management tools
├── discovery.ts     # Discovery and recommendation tools
├── lists.ts         # List management tools
├── context.ts       # Documentation context search
├── guidance.ts      # Best practices and guidance tools
└── README.md        # This file
```

## Tool Categories

### 1. Profile Tools (`profile.ts`)
- **getProfileStats** - Get follower/following counts with ENS resolution
- **getFollowers** - List followers with filtering, search, and tags
- **getFollowing** - List following with filtering, search, and tags

### 2. Account Tools (`account.ts`)
- **fetchAccount** - Get complete account information
- **fetchBulkAccounts** - Bulk ENS reverse resolution for addresses
- **fetchProfileLists** - Get all lists owned by a user
- **fetchProfileBadges** - Get POAP badges for a profile

### 3. Relationship Tools (`relationships.ts`)
- **checkFollowing** - Check if a list follows an address
- **checkFollower** - Check if one address follows another
- **fetchFollowState** - Get detailed follow state between addresses

### 4. Tag Tools (`tags.ts`)
- **fetchFollowingTags** - Get tag statistics for accounts being followed
- **fetchFollowerTags** - Get tag statistics for followers

### 5. Discovery Tools (`discovery.ts`)
- **fetchNotifications** - Get notifications for a user
- **fetchRecommendations** - Get profile recommendations
- **fetchLeaderboard** - Get top users by follower count

### 6. List Tools (`lists.ts`)
- **fetchAllFollowings** - Export complete list state
- **fetchListsForUser** - Get primary list and all lists for a user

### 7. Context Tools (`context.ts`)
- **searchContexts** - Search through documentation contexts

### 8. Guidance Tools (`guidance.ts`)
- **getBestPractices** - Get best practices for different scenarios
- **getUsagePattern** - Get usage patterns for common workflows
- **getToolGuidance** - Get tool recommendations for specific tasks
- **getEfficiencyTips** - Get performance optimization tips

**Total Tools: 22**

## Adding New Tools

To add a new tool:

1. **Choose the appropriate category** or create a new category file
2. **Add the tool registration** to the relevant file using the pattern:
   ```typescript
   server.tool(
     'toolName',
     {
       // Zod schema for parameters
     },
     async ({ parameters }) => {
       // Tool implementation
     }
   );
   ```
3. **Update the main registration** in `index.ts` if you created a new category file
4. **Update this README** to document the new tool

## Benefits of This Structure

- **Modularity**: Each category is self-contained and can be developed independently
- **Maintainability**: Easier to find and update specific tools
- **Scalability**: New tools can be added without cluttering the main file
- **Reusability**: Tool categories can be reused in other projects
- **Testing**: Each category can be tested independently
- **Documentation**: Clear organization makes the codebase easier to understand

## Dependencies

All tool files depend on:
- `@modelcontextprotocol/sdk/server/mcp.js` - For MCP server functionality
- `zod` - For parameter validation
- Various type definitions from `../types/api.ts`

Some tools also depend on:
- `../utils` - For utility functions like `arrayToChunks`
- `../contexts` - For context-related functionality
- `../types/env` - For environment type definitions