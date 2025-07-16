# ETHID MCP Server Initialization Prompt

## Overview

Before starting to use the ETHID MCP server, run this initialization prompt to ensure your AI assistant has access to all the best practices, tool guidance, and efficiency tips needed for optimal performance.

## The Initialization Prompt

Copy and paste the following prompt into your AI assistant before beginning any EFP-related queries:

---

**🚀 ETHID MCP Server Initialization**

Please run the following tools to initialize optimal ETHID MCP server usage:

1. **Load Best Practices:**
   - `getBestPractices` with scenario: `bulk-operations`
   - `getBestPractices` with scenario: `performance` 
   - `getBestPractices` with scenario: `data-analysis`
   - `getBestPractices` with scenario: `ens-resolution`

2. **Load Tool Guidance:**
   - `getToolGuidance` with task: `follower-analysis`
   - `getToolGuidance` with task: `network-exploration`
   - `getToolGuidance` with task: `ens-resolution`
   - `getToolGuidance` with task: `bulk-processing`

3. **Load Usage Patterns:**
   - `getUsagePattern` with queryType: `find-mutuals`
   - `getUsagePattern` with queryType: `tag-analysis`
   - `getUsagePattern` with queryType: `ens-resolution`
   - `getUsagePattern` with queryType: `bulk-ens-workflow`

4. **Load Efficiency Tips:**
   - `getEfficiencyTips` with area: `performance`
   - `getEfficiencyTips` with area: `bulk-operations`
   - `getEfficiencyTips` with area: `ens-resolution`

After loading these contexts, you'll be optimally configured for ETHID MCP server usage. Key reminders:

- **Always use `fetchBulkAccounts` for ENS resolution** - results maintain input order
- **Use the efficient tag querying pattern** - get tags first, then filter
- **Batch related queries** for better performance
- **Handle addresses without ENS names** gracefully (they return as addresses)

Now you're ready to efficiently query the Ethereum Follow Protocol! 🎯

---

## Why This Initialization is Important

### 1. **Optimal Tool Selection**
The initialization ensures the AI knows which tools to use for specific scenarios:
- `fetchBulkAccounts` for ENS resolution (not manual lookups)
- Efficient tag querying patterns
- Proper pagination strategies

### 2. **Performance Optimization**
Loading efficiency tips helps the AI:
- Batch requests appropriately
- Use pagination effectively
- Avoid slow query patterns

### 3. **ENS Resolution Best Practices**
Critical for proper address handling:
- Understanding order preservation in `fetchBulkAccounts`
- Handling addresses without ENS names
- Efficient bulk processing workflows

### 4. **Error Prevention**
Proper initialization prevents common mistakes:
- Using wrong tools for specific tasks
- Inefficient query patterns
- Misunderstanding API responses

## Example Usage

### Before Initialization (Inefficient):
```
User: "Show me who brantly.eth follows with readable names"
AI: Gets following list, then tries to resolve each address individually
Result: Slow, multiple API calls
```

### After Initialization (Efficient):
```
User: "Show me who brantly.eth follows with readable names"  
AI: Gets following list, extracts addresses, uses fetchBulkAccounts
Result: Fast, 2 API calls with proper order preservation
```

## Verification

After running the initialization prompt, verify by asking:
- "What's the best way to get ENS names for multiple addresses?"
- "How should I efficiently get all tagged users?"
- "What's the recommended pagination strategy?"

The AI should respond with the loaded best practices and tool guidance.

## Advanced Usage

For power users, you can also load specific contexts:

```
searchContexts with query: "ENS resolution patterns"
searchContexts with query: "tag filtering efficiency"
searchContexts with query: "bulk operations best practices"
```

This ensures your AI assistant is fully equipped with the knowledge needed for optimal ETHID MCP server usage.