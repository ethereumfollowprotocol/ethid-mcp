import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { formatQueryParams } from '../utils';
import { leaderboardFilters, LeaderboardResponse } from '../types/api';

export function registerDiscoveryTools(server: McpServer, baseUrl: string) {
	// fetchNotifications tool
	server.tool(
		'fetchNotifications',
		{
			userAddress: z.string().describe('User address'),
			interval: z.string().optional().describe('Time interval for notifications'),
		},
		async ({ userAddress, interval }) => {
			try {
				const url = new URL(`${baseUrl}/users/${userAddress}/notifications`);
				if (interval) url.searchParams.append('interval', interval);

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const notifications = await response.json();

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(notifications, null, 2),
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);

	// fetchRecommendations tool
	server.tool(
		'fetchRecommendations',
		{
			endpoint: z.enum(['recommended', 'discover']).describe('Recommendation endpoint to use'),
			addressOrName: z.string().optional().describe('ENS name or Ethereum address (for recommended endpoint)'),
			list: z.number().optional().describe('Optional list ID'),
			limit: z.number().optional().describe('Number of recommendations to return'),
			pageParam: z.number().optional().describe('Page number for pagination'),
		},
		async ({ endpoint, addressOrName, list, limit, pageParam }) => {
			try {
				let url: URL;
				if (endpoint === 'recommended' && addressOrName) {
					url = new URL(`${baseUrl}/users/${addressOrName}/recommended`);
				} else {
					url = new URL(`${baseUrl}/discover/${endpoint}`);
				}

				if (list) url.searchParams.append('list', list.toString());
				if (limit) url.searchParams.append('limit', limit.toString());
				if (pageParam) url.searchParams.append('pageParam', pageParam.toString());

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const recommendations = await response.json();

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(recommendations, null, 2),
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);

	// fetchLeaderboard tool
	server.tool(
		'fetchLeaderboard',
		{
			limit: z.number().optional().describe('Number of results to return'),
			search: z.string().optional().describe('Search term'),
			filter: z.enum(leaderboardFilters).optional().describe('Filter criteria'),
			pageParam: z.number().optional().describe('Page number for pagination'),
			direction: z.string().optional().describe('Sort direction'),
		},
		async ({ limit = 20, search, filter, pageParam = 0, direction }) => {
			try {
				const queryParams = formatQueryParams({
					limit,
					offset: pageParam * limit,
					sort: filter,
					direction,
				});
				const url = new URL(`${baseUrl}/leaderboard/${search && search.length > 2 ? 'search' : 'ranked'}?${queryParams}`);

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const leaderboard = (await response.json()) as LeaderboardResponse;

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(leaderboard, null, 2),
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);
}
