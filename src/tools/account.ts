import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AccountResponse, ProfileLists, ProfileBadge } from '../types/api';
import { arrayToChunks } from '../utils';

export function registerAccountTools(server: McpServer, baseUrl: string, ensWorkerUrl: string) {
	// fetchAccount tool
	server.tool(
		'fetchAccount',
		{
			addressOrName: z.string().describe('ENS name or Ethereum address'),
			list: z.number().optional().describe('Optional list ID'),
		},
		async ({ addressOrName, list }) => {
			try {
				const url = new URL(`${baseUrl}/users/${encodeURIComponent(addressOrName)}/account`);
				if (list !== undefined) {
					url.searchParams.append('list', list.toString());
				}

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const account = (await response.json()) as AccountResponse;

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(account, null, 2),
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);

	// fetchBulkAccounts tool
	server.tool(
		'fetchBulkAccounts',
		{
			addresses: z.array(z.string()).describe('Array of Ethereum addresses'),
		},
		async ({ addresses }) => {
			try {
				const chunks = arrayToChunks(addresses, 50);
				const batches = chunks.map((batch) => batch.map((id) => `queries[]=${id}`).join('&'));
				const responses = await Promise.all(
					batches.map(async (batch) => {
						return await fetch(`${ensWorkerUrl}/bulk/u?${batch}`);
					})
				);
				for (let i = 0; i < responses.length; i++) {
					const response = responses[i];
					if (!response.ok) {
						return {
							content: [
								{
									type: 'text',
									text: `Error: Failed to fetch bulk accounts. API returned ${response.status}`,
								},
							],
						};
					}
				}
				const data = await Promise.all(responses.map((response) => response.json()));
				const fetchedRecords = data.flatMap((datum: any) => datum.response);
				const results = addresses.map((addr) => {
					const entry = fetchedRecords.find((item: any) => item?.type !== 'error' && item?.address.toLowerCase() === addr.toLowerCase());
					return entry ? entry.name : addr;
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(results, null, 2),
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);

	// fetchProfileLists tool
	server.tool(
		'fetchProfileLists',
		{
			addressOrName: z.string().describe('ENS name or Ethereum address'),
			fresh: z.boolean().optional().describe('Whether to fetch fresh data'),
		},
		async ({ addressOrName, fresh }) => {
			try {
				const url = new URL(`${baseUrl}/users/${addressOrName}/lists`);
				if (fresh) url.searchParams.append('fresh', 'true');

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const lists = (await response.json()) as ProfileLists;

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

	// fetchProfileBadges tool
	server.tool(
		'fetchProfileBadges',
		{
			addressOrName: z.string().describe('ENS name or Ethereum address'),
			list: z.number().optional().describe('Optional list ID'),
			fresh: z.boolean().optional().describe('Whether to fetch fresh data'),
		},
		async ({ addressOrName, list, fresh }) => {
			try {
				const url = new URL(`${baseUrl}/users/${encodeURIComponent(addressOrName)}/badges`);
				if (list !== undefined) {
					url.searchParams.append('list', list.toString());
				}
				if (fresh) url.searchParams.append('cache', 'fresh');

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const badges = (await response.json()) as ProfileBadge[];

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(badges, null, 2),
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);
}