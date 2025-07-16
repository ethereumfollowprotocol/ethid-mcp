import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListStateResponse } from '../types/api';

export function registerListTools(server: McpServer, baseUrl: string) {
	// fetchAllFollowings tool
	server.tool(
		'fetchAllFollowings',
		'Export complete follow list data including all entries, tags, and metadata for a specific list ID',
		{
			list: z.number().describe('List ID to export'),
		},
		async ({ list }) => {
			try {
				const response = await fetch(`${baseUrl}/exportState/${list}`);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const state = (await response.json()) as ListStateResponse;

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(state, null, 2),
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);

	// fetchListsForUser tool
	server.tool(
		'fetchListsForUser',
		'Get all follow lists owned by a specific Ethereum address or ENS name',
		{
			addressOrName: z.string().describe('ENS name or Ethereum address'),
		},
		async ({ addressOrName }) => {
			try {
				const response = await fetch(`${baseUrl}/users/${addressOrName}/lists`);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const lists = await response.json();

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(lists, null, 2),
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);
}