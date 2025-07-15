import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StatsResponse, AccountResponse, FollowersListResponse, FollowingListResponse } from '../types/api';

export function registerProfileTools(server: McpServer, baseUrl: string) {
	// getProfileStats tool
	server.tool(
		'getProfileStats',
		{ addressOrName: z.string().describe("ENS name (e.g., 'brantly.eth') or Ethereum address") },
		async ({ addressOrName }) => {
			try {
				const statsResponse = await fetch(`${baseUrl}/users/${addressOrName}/stats`);
				if (!statsResponse.ok) {
					throw new Error(`API Error: ${statsResponse.status} ${statsResponse.statusText}`);
				}
				const stats = (await statsResponse.json()) as StatsResponse;

				const accountResponse = await fetch(`${baseUrl}/users/${addressOrName}/account`);
				const account = accountResponse.ok ? ((await accountResponse.json()) as AccountResponse) : null;

				return {
					content: [
						{
							type: 'text',
							text: `${account?.ens?.name || addressOrName} has ${stats.followers_count || 0} followers and is following ${
								stats.following_count || 0
							} accounts.`,
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);

	// getFollowers tool
	server.tool(
		'getFollowers',
		{
			addressOrName: z.string().describe('ENS name or Ethereum address'),
			limit: z.number().optional().default(10).describe('Number of followers to return'),
			tags: z.array(z.string()).optional().describe('Tags to filter by'),
			search: z.string().optional().describe('Search term to filter results'),
			sort: z.string().optional().default('follower count').describe("Sort order: 'earliest first', 'latest first', or 'follower count'"),
		},
		async ({ addressOrName, limit = 10, tags, search, sort = 'follower count' }) => {
			try {
				const followersEndpoint = search && search.length > 0 ? 'searchFollowers' : 'followers';
				const url = new URL(`${baseUrl}/users/${encodeURIComponent(addressOrName)}/${followersEndpoint}`);

				url.searchParams.append('limit', limit.toString());
				if (tags?.length) url.searchParams.append('tags', tags.join(','));
				if (search) url.searchParams.append('term', search);

				const sortMap = {
					'earliest first': 'earliest',
					'latest first': 'latest',
					'follower count': 'followers',
				};
				if (sort) url.searchParams.append('sort', sortMap[sort as keyof typeof sortMap]);

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const data = (await response.json()) as FollowersListResponse;

				const followers = data.followers || [];
				const followerList = followers.map((f: any) => ({
					address: f.address,
					ens: f.ens?.name,
					followerCount: f.follower_count || 0,
					tags: f.tags || [],
				}));

				return {
					content: [
						{
							type: 'text',
							text: `Followers of ${addressOrName}:\n${
								followerList.map((f: any) => `${f.ens || f.address} ${f.tags?.length ? ` [${f.tags.join(', ')}]` : ''}`).join('\n') ||
								'No followers found'
							}`,
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);

	// getFollowing tool
	server.tool(
		'getFollowing',
		{
			addressOrName: z.string().describe('ENS name or Ethereum address'),
			limit: z.number().optional().default(10).describe('Number of following to return'),
			offset: z.number().optional().describe('Offset for pagination'),
			tags: z.array(z.string()).optional().describe('Tags to filter by'),
			search: z.string().optional().describe('Search term to filter results'),
			sort: z.string().optional().default('follower count').describe("Sort order: 'earliest first', 'latest first', or 'follower count'"),
		},
		async ({ addressOrName, limit = 10, offset, tags, search, sort = 'follower count' }) => {
			try {
				const followingEndpoint = search && search.length > 0 ? 'searchFollowing' : 'following';
				const url = new URL(`${baseUrl}/users/${encodeURIComponent(addressOrName)}/${followingEndpoint}`);

				url.searchParams.append('limit', limit.toString());
				if (offset !== undefined) url.searchParams.append('offset', offset.toString());
				if (tags?.length) url.searchParams.append('tags', tags.join(','));
				if (search) url.searchParams.append('term', search);

				const sortMap = {
					'earliest first': 'earliest',
					'latest first': 'latest',
					'follower count': 'followers',
				};
				if (sort) url.searchParams.append('sort', sortMap[sort as keyof typeof sortMap]);

				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const data = (await response.json()) as FollowingListResponse;

				const following = data.following || [];
				const followingList = following.map((f: any) => ({
					address: f.address,
					ens: f.ens?.name,
					followerCount: f.follower_count || 0,
					tags: f.tags || [],
				}));

				return {
					content: [
						{
							type: 'text',
							text: `${addressOrName} is following:\n${
								followingList.map((f: any) => `${f.ens || f.address} ${f.tags?.length ? ` [${f.tags.join(', ')}]` : ''}`).join('\n') ||
								'Not following anyone'
							}`,
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);
}