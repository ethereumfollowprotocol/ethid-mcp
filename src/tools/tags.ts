import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerTagTools(server: McpServer, baseUrl: string) {
	// fetchFollowingTags tool
	server.tool(
		'fetchFollowingTags',
		'Fetch tags that a user has applied to accounts they follow (e.g., "friend", "top8", "family")',
		{
			addressOrName: z.string().describe('ENS name or Ethereum address'),
			list: z.number().optional().describe('Optional list ID'),
			fresh: z.boolean().optional().describe('Whether to fetch fresh data'),
		},
		async ({ addressOrName, list, fresh }) => {
			try {
				const url = new URL(`${baseUrl}/users/${encodeURIComponent(addressOrName)}/tags`);
				if (list !== undefined) {
					url.searchParams.append('list', list.toString());
				}
				if (fresh) url.searchParams.append('cache', 'fresh');

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const tags = await response.json();

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(tags, null, 2),
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);

	// fetchFollowerTags tool
	server.tool(
		'fetchFollowerTags',
		'Fetch tags that have been applied to a user by their followers (reverse tag lookup)',
		{
			addressOrName: z.string().describe('ENS name or Ethereum address'),
			list: z.number().optional().describe('Optional list ID'),
			fresh: z.boolean().optional().describe('Whether to fetch fresh data'),
		},
		async ({ addressOrName, list, fresh }) => {
			try {
				const url = new URL(`${baseUrl}/users/${encodeURIComponent(addressOrName)}/followerTags`);
				if (list !== undefined) {
					url.searchParams.append('list', list.toString());
				}
				if (fresh) url.searchParams.append('cache', 'fresh');

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const tags = await response.json();

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(tags, null, 2),
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);
}