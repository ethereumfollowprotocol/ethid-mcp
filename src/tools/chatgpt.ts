import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StatsResponse, AccountResponse, FollowersListResponse, FollowingListResponse } from '../types/api';

// Types for ChatGPT search/fetch pattern
interface SearchResult {
	id: string;
	title: string;
	description: string;
	type: 'profile' | 'follower' | 'following' | 'list';
}

interface ProfileRecord {
	id: string;
	address: string;
	ens?: string;
	followerCount: number;
	followingCount: number;
	tags?: string[];
	lists?: any[];
	metadata?: any;
}

export function registerChatGPTTools(server: McpServer, baseUrl: string, ensWorkerUrl: string) {
	// Search tool - required by ChatGPT
	server.tool(
		'search',
		'Search for Ethereum addresses, ENS names, or profiles in the EFP ecosystem. Returns IDs that can be fetched for detailed information.',
		{
			query: z.string().describe('Search query - can be an ENS name, Ethereum address, or general search term for profiles'),
			limit: z.number().optional().default(10).describe('Maximum number of results to return (default: 10)'),
			type: z.enum(['profile', 'follower', 'following', 'all']).optional().default('all').describe('Type of search to perform')
		},
		async ({ query, limit = 10, type = 'all' }) => {
			try {
				const results: SearchResult[] = [];

				// If query looks like an address or ENS name, search for exact match first
				if (query.includes('.eth') || query.match(/^0x[a-fA-F0-9]{40}$/)) {
					try {
						const statsResponse = await fetch(`${baseUrl}/users/${encodeURIComponent(query)}/stats`);
						if (statsResponse.ok) {
							const stats = await statsResponse.json() as StatsResponse;
							const accountResponse = await fetch(`${baseUrl}/users/${encodeURIComponent(query)}/account`);
							const account = accountResponse.ok ? await accountResponse.json() as AccountResponse : null;
							
							results.push({
								id: `profile:${query}`,
								title: account?.ens?.name || query,
								description: `Profile with ${stats.followers_count || 0} followers and following ${stats.following_count || 0} accounts`,
								type: 'profile'
							});
						}
					} catch (e) {
						// Profile not found, continue with other searches
					}
				}

				// Search for popular profiles in leaderboard
				if ((type === 'follower' || type === 'all') && results.length < limit) {
					try {
						const leaderboardResponse = await fetch(`${baseUrl}/discover/leaderboard?limit=${Math.min(20, limit * 2)}`);
						if (leaderboardResponse.ok) {
							const leaderboard = await leaderboardResponse.json();
							if (leaderboard.accounts) {
								for (const account of leaderboard.accounts) {
									const name = account.ens?.name || account.address;
									if (name.toLowerCase().includes(query.toLowerCase()) && results.length < limit) {
										results.push({
											id: `profile:${account.address}`,
											title: name,
											description: `Popular profile with ${account.follower_count || 0} followers`,
											type: 'profile'
										});
									}
								}
							}
						}
					} catch (e) {
						// Leaderboard search failed, continue
					}
				}

				// If no results found, provide helpful suggestions
				if (results.length === 0) {
					results.push({
						id: 'help:search',
						title: 'Search Help',
						description: 'Try searching with an ENS name (e.g., vitalik.eth) or Ethereum address',
						type: 'profile'
					});
				}

				return {
					content: [{
						type: 'text',
						text: JSON.stringify({
							ids: results.map(r => r.id),
							results: results
						})
					}]
				};
			} catch (error) {
				return {
					content: [{
						type: 'text',
						text: JSON.stringify({
							ids: [],
							error: error instanceof Error ? error.message : 'Unknown error'
						})
					}]
				};
			}
		}
	);

	// Fetch tool - required by ChatGPT
	server.tool(
		'fetch',
		'Fetch detailed information for a specific ID returned by the search tool.',
		{
			id: z.string().describe('ID returned from search results (format: type:identifier)')
		},
		async ({ id }) => {
			try {
				const [type, identifier] = id.split(':', 2);

				if (type === 'help') {
					return {
						content: [{
							type: 'text',
							text: JSON.stringify({
								title: 'EFP Search Help',
								content: 'Search with ENS names like vitalik.eth or Ethereum addresses',
								type: 'help'
							})
						}]
					};
				}

				if (type === 'profile') {
					const profileData: ProfileRecord = {
						id: id,
						address: identifier,
						followerCount: 0,
						followingCount: 0
					};

					// Get basic stats
					try {
						const statsResponse = await fetch(`${baseUrl}/users/${encodeURIComponent(identifier)}/stats`);
						if (statsResponse.ok) {
							const stats = await statsResponse.json() as StatsResponse;
							profileData.followerCount = stats.followers_count || 0;
							profileData.followingCount = stats.following_count || 0;
						}
					} catch (e) {}

					// Get account details
					try {
						const accountResponse = await fetch(`${baseUrl}/users/${encodeURIComponent(identifier)}/account`);
						if (accountResponse.ok) {
							const account = await accountResponse.json() as AccountResponse;
							profileData.ens = account.ens?.name;
							profileData.metadata = {
								avatar: account.ens?.avatar,
								description: account.ens?.description,
								twitter: account.ens?.twitter,
								github: account.ens?.github,
								website: account.ens?.url
							};
						}
					} catch (e) {}

					return {
						content: [{
							type: 'text',
							text: JSON.stringify(profileData, null, 2)
						}]
					};
				}

				return {
					content: [{
						type: 'text',
						text: JSON.stringify({
							error: `Unknown ID format: ${id}`
						})
					}]
				};
			} catch (error) {
				return {
					content: [{
						type: 'text',
						text: JSON.stringify({
							error: error instanceof Error ? error.message : 'Unknown error',
							id: id
						})
					}]
				};
			}
		}
	);
}
