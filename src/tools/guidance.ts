import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerGuidanceTools(server: McpServer) {
	// getBestPractices tool
	server.tool(
		'getBestPractices',
		'Get best practices and recommendations for using ETHID MCP tools effectively',
		{
			scenario: z.string().optional().describe('Usage scenario'),
		},
		async ({ scenario }) => {
			const practices = {
				'bulk-operations': {
					title: 'Bulk Operations Best Practices',
					content: `When performing bulk operations with ETHID MCP:

1. **Use pagination**: For large datasets, use limit and offset/pageParam
2. **Batch requests**: Group related queries together
3. **ENS reverse resolution**: Use fetchBulkAccounts to convert plain addresses to ENS names
4. **Cache results**: Store frequently accessed data locally
5. **Error handling**: Implement retry logic for failed requests
6. **Rate limiting**: Respect API rate limits to avoid throttling`,
				},
				performance: {
					title: 'Performance Optimization',
					content: `To optimize ETHID MCP performance:

1. **Use specific endpoints**: Prefer targeted queries over broad searches
2. **Limit results**: Only request the data you need
3. **Use search filters**: Apply tags and search terms to reduce data
4. **Cache static data**: Store unchanging data like ENS names
5. **Parallel requests**: Make independent requests concurrently
6. **Bulk ENS resolution**: Use fetchBulkAccounts for multiple address lookups`,
				},
				'data-analysis': {
					title: 'Data Analysis Best Practices',
					content: `For analyzing EFP social graph data:

1. **Start with stats**: Use getProfileStats for overview
2. **Filter by tags**: Focus on specific communities or interests
3. **Use leaderboard**: Identify influential accounts
4. **Track changes**: Monitor follower growth over time
5. **Export data**: Use fetchAllFollowings for offline analysis
6. **ENS resolution**: Use fetchBulkAccounts to resolve addresses to readable names`,
				},
				'ens-resolution': {
					title: 'ENS Name Resolution Best Practices',
					content: `When working with Ethereum addresses and ENS names:

1. **Use fetchBulkAccounts**: Convert multiple addresses to ENS names efficiently
2. **Preserve order**: Results return in the same order as input addresses
3. **Handle non-resolvable addresses**: Not all addresses have ENS names - they return as addresses
4. **No matching needed**: Input/output arrays maintain 1:1 correspondence
5. **Batch processing**: Process up to 10 addresses per request for optimal performance
6. **Cache results**: ENS names rarely change, cache reverse-resolved results`,
				},
			};

			const content =
				scenario && practices[scenario as keyof typeof practices]
					? `## ${practices[scenario as keyof typeof practices].title}\n\n${practices[scenario as keyof typeof practices].content}`
					: Object.values(practices)
							.map((p) => `## ${p.title}\n\n${p.content}`)
							.join('\n\n');

			return {
				content: [
					{
						type: 'text',
						text: content,
					},
				],
			};
		}
	);

	// getUsagePattern tool
	server.tool(
		'getUsagePattern',
		'Get common usage patterns and code examples for specific ETHID MCP use cases',
		{
			queryType: z.string().optional().describe('Type of query pattern needed'),
		},
		async ({ queryType }) => {
			const patterns = {
				'find-mutuals': {
					title: 'Finding Mutual Connections',
					pattern: `1. Get following list for user A
2. For each following, check if they follow user A back
3. Filter results to show only mutual connections`,
					example: `// Get user A's following
const following = await getFollowing({ addressOrName: "userA.eth" });
// Check each for mutual follow
for (const user of following) {
  const isMutual = await checkFollower({
    addressOrName: user.address,
    follower: "userA.eth"
  });
}`,
				},
				'tag-analysis': {
					title: 'Analyzing Tag Usage',
					pattern: `1. Fetch follower/following tags
2. Count tag frequency
3. Identify top tags and trends`,
					example: `// Get all tags used
const tags = await fetchFollowingTags({ addressOrName: "user.eth" });
// Analyze tag distribution`,
				},
				'network-growth': {
					title: 'Tracking Network Growth',
					pattern: `1. Fetch initial stats
2. Store timestamp
3. Periodically refetch and compare
4. Calculate growth metrics`,
					example: `// Get current stats
const stats = await getProfileStats({
  addressOrName: "user.eth",
  isLive: true
});
// Compare with previous data`,
				},
				'ens-resolution': {
					title: 'Converting Addresses to ENS Names',
					pattern: `1. Collect addresses from API responses
2. Use fetchBulkAccounts to resolve to ENS names
3. Results maintain input order
4. Handle addresses without ENS names (they return as addresses)`,
					example: `// Get followers (returns addresses)
const followers = await getFollowers({ addressOrName: "user.eth" });
const addresses = followers.map(f => f.address);

// Resolve to ENS names
const resolved = await fetchBulkAccounts({ addresses });
// resolved[0] corresponds to addresses[0], etc.
// If no ENS name exists, the address is returned unchanged`,
				},
			};

			const content =
				queryType && patterns[queryType as keyof typeof patterns]
					? `## ${patterns[queryType as keyof typeof patterns].title}\n\n### Pattern:\n${
							patterns[queryType as keyof typeof patterns].pattern
					  }\n\n### Example:\n\`\`\`javascript\n${patterns[queryType as keyof typeof patterns].example}\n\`\`\``
					: Object.entries(patterns)
							.map(([key, p]) => `## ${p.title}\n\n### Pattern:\n${p.pattern}\n\n### Example:\n\`\`\`javascript\n${p.example}\n\`\`\``)
							.join('\n\n');

			return {
				content: [
					{
						type: 'text',
						text: content,
					},
				],
			};
		}
	);

	// getToolGuidance tool
	server.tool(
		'getToolGuidance',
		'Get recommended tools and approaches for specific EFP-related tasks',
		{
			task: z.string().optional().describe('Task description'),
		},
		async ({ task }) => {
			const guidance = {
				'follower-analysis': {
					tools: ['getProfileStats', 'getFollowers', 'fetchFollowerTags'],
					description: 'For analyzing followers, start with getProfileStats for overview, then use getFollowers for details.',
				},
				'network-exploration': {
					tools: ['getFollowing', 'fetchRecommendations', 'fetchLeaderboard'],
					description: 'To explore networks, use getFollowing to see connections, fetchRecommendations for discovery.',
				},
				'tag-management': {
					tools: ['fetchFollowingTags', 'fetchFollowerTags', 'getFollowers with tags filter'],
					description: 'For tag analysis, use fetchFollowingTags/fetchFollowerTags to see all tags, then filter with getFollowers.',
				},
				'profile-details': {
					tools: ['fetchAccount', 'getProfileStats', 'fetchProfileBadges'],
					description: 'For complete profile info, use fetchAccount for ENS data, getProfileStats for metrics.',
				},
				'ens-resolution': {
					tools: ['fetchBulkAccounts'],
					description:
						'To convert addresses to ENS names, use fetchBulkAccounts. Results maintain input order - addresses without ENS names return as addresses.',
				},
				'address-conversion': {
					tools: ['fetchBulkAccounts'],
					description: 'When you have plain addresses and need readable names, fetchBulkAccounts handles bulk conversion efficiently.',
				},
				'bulk-processing': {
					tools: ['fetchBulkAccounts', 'getFollowers', 'getFollowing'],
					description: 'For processing multiple addresses, use fetchBulkAccounts for ENS resolution, then other tools for detailed data.',
				},
				'documentation': {
					tools: ['searchContexts', 'getBestPractices', 'getUsagePattern'],
					description: 'For learning about EFP protocols, features, or technical details, use searchContexts with specific keywords. Categories: "protocols" (EFP, ENS, EIK, SIWE), "usage" (guides, patterns), "technical" (architecture, API).',
				},
				'protocol-info': {
					tools: ['searchContexts with category:"protocols"'],
					description: 'To understand Ethereum protocols (EFP, ENS, EIK, SIWE), search contexts with the protocol name or use category:"protocols" filter.',
				},
				'api-documentation': {
					tools: ['searchContexts', 'getEfficiencyTips'],
					description: 'For API usage and technical documentation, searchContexts with keywords like "API", "endpoint", "technical" or specific tool names.',
				},
				'getting-started': {
					tools: ['searchContexts with "quickstart"', 'getUsagePattern', 'getBestPractices'],
					description: 'New users should searchContexts for "quickstart", "getting started", or "introduction" to find comprehensive guides.',
				},
				'troubleshooting': {
					tools: ['searchContexts', 'getEfficiencyTips', 'getBestPractices'],
					description: 'For debugging or optimization, search for specific error messages, tool names, or use getEfficiencyTips for performance issues.',
				},
			};

			const taskLower = task?.toLowerCase() || '';
			const relevantGuidance = Object.entries(guidance).find(
				([key, _]) => taskLower.includes(key.split('-')[0]) || taskLower.includes(key.split('-')[1])
			);

			const content = relevantGuidance
				? `For "${task}":\n\nRecommended tools: ${relevantGuidance[1].tools.join(', ')}\n\n${relevantGuidance[1].description}`
				: `Available tool categories:\n\n${Object.entries(guidance)
						.map(([key, g]) => `**${key}**: ${g.tools.join(', ')}\n${g.description}`)
						.join('\n\n')}\n\n## Context Search Categories\n\nUse **searchContexts** with these categories for better results:\n- **"protocols"**: EFP, ENS, EIK, SIWE protocol documentation\n- **"usage"**: Usage guides, patterns, and best practices\n- **"technical"**: API documentation, architecture, and technical details\n\nExample: \`searchContexts({ query: "EFP API", category: "technical" })\``;

			return {
				content: [
					{
						type: 'text',
						text: content,
					},
				],
			};
		}
	);

	// getEfficiencyTips tool
	server.tool(
		'getEfficiencyTips',
		'Get performance optimization tips and efficiency recommendations for ETHID MCP usage',
		{
			area: z.string().optional().describe('Performance area to optimize'),
		},
		async ({ area }) => {
			const tips = {
				'api-calls': {
					title: 'Reducing API Calls',
					tips: [
						'Use getProfileStats instead of separate follower/following counts',
						'Cache ENS resolutions - they rarely change',
						'Use bulk endpoints when available',
						'Implement local result caching with TTL',
						'Batch related queries in single session',
					],
				},
				'data-size': {
					title: 'Managing Data Size',
					tips: [
						'Use limit parameter to control response size',
						'Apply filters (tags, search) before fetching',
						'Request only needed fields when possible',
						'Use pagination for large datasets',
						'Compress and store historical data',
					],
				},
				'response-time': {
					title: 'Improving Response Time',
					tips: [
						'Make parallel requests for independent data',
						'Use specific endpoints over generic ones',
						'Implement progressive loading for UIs',
						'Cache frequently accessed data',
						'Use lightweight endpoints for real-time features',
					],
				},
				'context-search': {
					title: 'Optimizing Context Search',
					tips: [
						'Use specific keywords instead of broad terms (e.g., "EFP API" vs "documentation")',
						'Use category filters to narrow results: "protocols", "usage", "technical"',
						'Search for protocol names directly: "EFP", "ENS", "EIK", "SIWE"',
						'Use tool names for specific guidance: "getFollowers", "fetchAccount"',
						'Combine multiple short searches rather than one complex query',
						'Search for error messages or specific issues when troubleshooting',
					],
				},
				'documentation': {
					title: 'Finding Documentation Efficiently',
					tips: [
						'Start with searchContexts for specific topics before using general tools',
						'Use category:"protocols" for understanding blockchain protocols',
						'Use category:"usage" for patterns and best practices',
						'Use category:"technical" for API details and architecture',
						'Search for "quickstart" or "getting started" for new user guides',
						'Search for specific error messages when debugging',
					],
				},
			};

			const content =
				area && tips[area as keyof typeof tips]
					? `## ${tips[area as keyof typeof tips].title}\n\n${tips[area as keyof typeof tips].tips
							.map((tip, i) => `${i + 1}. ${tip}`)
							.join('\n')}`
					: Object.entries(tips)
							.map(([_, t]) => `## ${t.title}\n\n${t.tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}`)
							.join('\n\n');

			return {
				content: [
					{
						type: 'text',
						text: content,
					},
				],
			};
		}
	);
}