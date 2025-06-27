import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { EFPAPIClient } from './utils/api-client';
import { ContextManager } from './utils/context-manager';
import { ContextLoader } from './utils/context-loader';

export interface Env {
	EFP_API_URL?: string;
	EFP_API_KEY?: string;
	CONTEXT_KV?: any; // Cloudflare KV namespace for storing contexts
}

export class EFPMCPServer {
	server: Server;
	env: Env;
	apiClient: EFPAPIClient;
	contextManager: ContextManager;

	constructor(env: Env) {
		this.env = env;
		const baseUrl = env.EFP_API_URL || 'https://api.ethfollow.xyz/api/v1';
		this.apiClient = new EFPAPIClient(baseUrl);
		this.contextManager = new ContextManager(false);

		this.server = new Server(
			{
				name: 'efp-mcp',
				version: '1.0.0',
			},
			{
				capabilities: {
					tools: {},
				},
			}
		);
	}

	private async resolveENSName(address: string): Promise<string> {
		try {
			const accountData = (await this.apiClient.fetchAccount(address)) as { ens?: { name?: string } } | null;
			return accountData?.ens?.name || address;
		} catch {
			return address;
		}
	}

	private async resolveENSNames(items: Array<{ address: string; ens?: { name: string } }>): Promise<string[]> {
		return Promise.all(
			items.map(async (item) => {
				if (item.ens?.name) return item.ens.name;
				return this.resolveENSName(item.address);
			})
		);
	}

	async init() {
		// Load contexts
		ContextLoader.loadFromModules(this.contextManager);
		if (this.env.CONTEXT_KV) {
			await ContextLoader.loadFromKV(this.contextManager, this.env.CONTEXT_KV);
		}

		// Register MCP handlers
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: [
				// Basic follower/following functionality
				{
					name: 'getFollowerCount',
					description: 'Get the number of followers and following for an ENS name or Ethereum address',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: "ENS name (e.g., 'brantly.eth') or Ethereum address",
							},
						},
						required: ['addressOrName'],
					},
				},
				{
					name: 'getFollowers',
					description: 'Get a list of followers for an ENS name or Ethereum address',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
							limit: {
								type: 'number',
								description: 'Number of followers to return',
								default: 10,
							},
							tags: {
								type: 'array',
								items: { type: 'string' },
								description: 'Tags to filter by',
							},
							search: {
								type: 'string',
								description: 'Search term to filter results',
							},
							sort: {
								type: 'string',
								description: 'Sort order (earliest first, latest first, follower count)',
								default: 'follower count',
							},
						},
						required: ['addressOrName'],
					},
				},
				{
					name: 'getFollowing',
					description: 'Get a list of accounts an ENS name or Ethereum address is following',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
							limit: {
								type: 'number',
								description: 'Number of following to return',
								default: 10,
							},
							tags: {
								type: 'array',
								items: { type: 'string' },
								description: 'Tags to filter by',
							},
							search: {
								type: 'string',
								description: 'Search term to filter results',
							},
							sort: {
								type: 'string',
								description: 'Sort order (earliest first, latest first, follower count)',
								default: 'follower count',
							},
						},
						required: ['addressOrName'],
					},
				},

				// Following/Followers checking functionality
				{
					name: 'checkFollowing',
					description: 'Check if one list follows another',
					inputSchema: {
						type: 'object',
						properties: {
							list: {
								type: 'number',
								description: 'List ID to check',
							},
							following: {
								type: 'string',
								description: 'Address or ENS name to check if being followed',
							},
						},
						required: ['list', 'following'],
					},
				},
				{
					name: 'checkFollower',
					description: 'Check if an address/ENS name follows another',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'Address or ENS name to check follower state',
							},
							follower: {
								type: 'string',
								description: 'Address or ENS name to check if following',
							},
						},
						required: ['addressOrName', 'follower'],
					},
				},

				// Account and profile functionality
				{
					name: 'fetchAccount',
					description: 'Get account info with ENS data',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
							list: {
								type: 'number',
								description: 'Optional list ID',
							},
						},
						required: ['addressOrName'],
					},
				},
				{
					name: 'fetchProfileStats',
					description: 'Get detailed profile statistics',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
							list: {
								type: 'number',
								description: 'Optional list ID',
							},
							isLive: {
								type: 'boolean',
								description: 'Whether to get live data',
							},
						},
						required: ['addressOrName'],
					},
				},
				{
					name: 'fetchProfileLists',
					description: 'Get EFP lists owned by an address',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
							fresh: {
								type: 'boolean',
								description: 'Whether to fetch fresh data',
							},
						},
						required: ['addressOrName'],
					},
				},
				{
					name: 'fetchProfileBadges',
					description: 'Get POAP badges for a profile',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
							list: {
								type: 'number',
								description: 'Optional list ID',
							},
							fresh: {
								type: 'boolean',
								description: 'Whether to fetch fresh data',
							},
						},
						required: ['addressOrName'],
					},
				},
				{
					name: 'fetchProfileQRCode',
					description: 'Get QR code for profile',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
						},
						required: ['addressOrName'],
					},
				},

				// Advanced following/followers functionality
				{
					name: 'fetchProfileFollowing',
					description: 'Advanced following with filters',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
							list: {
								type: 'number',
								description: 'Optional list ID',
							},
							limit: {
								type: 'number',
								description: 'Number of results to return',
								default: 10,
							},
							pageParam: {
								type: 'number',
								description: 'Page number for pagination',
								default: 0,
							},
							search: {
								type: 'string',
								description: 'Search term to filter results',
							},
							sort: {
								type: 'string',
								description: 'Sort order (earliest first, latest first, follower count)',
							},
							tags: {
								type: 'array',
								items: { type: 'string' },
								description: 'Tags to filter by',
							},
							allResults: {
								type: 'boolean',
								description: 'Whether to get all results',
							},
							fresh: {
								type: 'boolean',
								description: 'Whether to fetch fresh data',
							},
						},
						required: ['addressOrName'],
					},
				},
				{
					name: 'fetchProfileFollowers',
					description: 'Advanced followers with filters',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
							list: {
								type: 'number',
								description: 'Optional list ID',
							},
							limit: {
								type: 'number',
								description: 'Number of results to return',
								default: 10,
							},
							pageParam: {
								type: 'number',
								description: 'Page number for pagination',
								default: 0,
							},
							search: {
								type: 'string',
								description: 'Search term to filter results',
							},
							sort: {
								type: 'string',
								description: 'Sort order (earliest first, latest first, follower count)',
							},
							tags: {
								type: 'array',
								items: { type: 'string' },
								description: 'Tags to filter by',
							},
							allResults: {
								type: 'boolean',
								description: 'Whether to get all results',
							},
							fresh: {
								type: 'boolean',
								description: 'Whether to fetch fresh data',
							},
						},
						required: ['addressOrName'],
					},
				},

				// Tags functionality
				{
					name: 'fetchFollowingTags',
					description: 'Get tags for following',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
							list: {
								type: 'number',
								description: 'Optional list ID',
							},
							fresh: {
								type: 'boolean',
								description: 'Whether to fetch fresh data',
							},
						},
						required: ['addressOrName'],
					},
				},
				{
					name: 'fetchFollowerTags',
					description: 'Get tags for followers',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
							list: {
								type: 'number',
								description: 'Optional list ID',
							},
							fresh: {
								type: 'boolean',
								description: 'Whether to fetch fresh data',
							},
						},
						required: ['addressOrName'],
					},
				},

				// Follow state functionality
				{
					name: 'fetchFollowState',
					description: 'Get follow state between addresses',
					inputSchema: {
						type: 'object',
						properties: {
							lookupAddressOrName: {
								type: 'string',
								description: 'Address or ENS name to lookup',
							},
							connectedAddress: {
								type: 'string',
								description: 'Connected address',
							},
							list: {
								type: 'number',
								description: 'Optional list ID',
							},
							type: {
								type: 'string',
								enum: ['following', 'followers'],
								description: 'Type of follow state to check',
								default: 'following',
							},
							fresh: {
								type: 'boolean',
								description: 'Whether to fetch fresh data',
							},
						},
						required: ['lookupAddressOrName'],
					},
				},

				// Notifications
				{
					name: 'fetchNotifications',
					description: 'Get user notifications',
					inputSchema: {
						type: 'object',
						properties: {
							userAddress: {
								type: 'string',
								description: 'User address',
							},
							interval: {
								type: 'string',
								enum: ['hour', 'day', 'week', 'month', 'all'],
								description: 'Time interval for notifications',
								default: 'all',
							},
						},
						required: ['userAddress'],
					},
				},

				// Recommendations and discovery
				{
					name: 'fetchRecommendations',
					description: 'Get recommended profiles',
					inputSchema: {
						type: 'object',
						properties: {
							endpoint: {
								type: 'string',
								enum: ['discover', 'recommended'],
								description: 'Recommendation endpoint to use',
							},
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address (for recommended endpoint)',
							},
							list: {
								type: 'number',
								description: 'Optional list ID',
							},
							limit: {
								type: 'number',
								description: 'Number of recommendations to return',
								default: 10,
							},
							pageParam: {
								type: 'number',
								description: 'Page number for pagination',
								default: 1,
							},
						},
						required: ['endpoint'],
					},
				},

				// Leaderboard
				{
					name: 'fetchLeaderboard',
					description: 'Get top users by followers',
					inputSchema: {
						type: 'object',
						properties: {
							limit: {
								type: 'number',
								description: 'Number of results to return',
								default: 10,
							},
							search: {
								type: 'string',
								description: 'Search term',
							},
							filter: {
								type: 'string',
								description: 'Filter criteria',
							},
							pageParam: {
								type: 'number',
								description: 'Page number for pagination',
								default: 0,
							},
							direction: {
								type: 'string',
								description: 'Sort direction',
							},
						},
						required: [],
					},
				},

				// POAP
				{
					name: 'fetchPoapLink',
					description: 'Get POAP link',
					inputSchema: {
						type: 'object',
						properties: {
							userAddress: {
								type: 'string',
								description: 'User address',
							},
						},
						required: ['userAddress'],
					},
				},

				// List state
				{
					name: 'fetchListState',
					description: 'Export EFP list state',
					inputSchema: {
						type: 'object',
						properties: {
							list: {
								type: 'number',
								description: 'List ID to export',
							},
						},
						required: ['list'],
					},
				},
				{
					name: 'fetchListsForUser',
					description: 'Get a primary list and all lists for a user',
					inputSchema: {
						type: 'object',
						properties: {
							addressOrName: {
								type: 'string',
								description: 'ENS name or Ethereum address',
							},
						},
						required: ['addressOrName'],
					},
				},
			],
		}));

		// Register the request handler that delegates to handleMCPRequest
		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			return await this.handleMCPRequest(request);
		});
	}

	private async handleMCPRequest(request: {
		params: {
			name: string;
			arguments?: {
				// Basic parameters
				addressOrName?: string;
				limit?: number;
				query?: string;
				// Advanced parameters
				list?: number;
				following?: string;
				connectedAddress?: string;
				lookupAddressOrName?: string;
				type?: 'following' | 'followers';
				interval?: 'hour' | 'day' | 'week' | 'month' | 'all';
				endpoint?: 'discover' | 'recommended';
				pageParam?: number;
				search?: string;
				filter?: string;
				direction?: string;
				userAddress?: string;
				tags?: string[];
				sort?: string;
				allResults?: boolean;
				fresh?: boolean;
				isLive?: boolean;
				[key: string]: any;
			};
		};
	}) {
		console.log('handleMCPRequest called with:', JSON.stringify(request, null, 2));
		const { name, arguments: args } = request.params;

		switch (name) {
			case 'getFollowerCount': {
				console.log('getFollowerCount called with args:', args);
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				console.log('Making API call for:', args.addressOrName);
				const result = await this.apiClient.getFollowerCount(args.addressOrName);
				console.log('API result:', result);
				if (result.error) {
					return {
						content: [{ type: 'text', text: `Error: ${result.error}` }],
					};
				}
				return {
					content: [
						{
							type: 'text',
							text: `${args.addressOrName} has ${result.followers_count} followers and ${result.following_count} following`,
						},
					],
				};
			}

			case 'getFollowers': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const result = await this.apiClient.getFollowers(
					args.addressOrName, 
					args.limit || 10,
					args.tags || [],
					args.search || '',
					args.sort || 'follower count'
				);
				if (result.error) {
					return { content: [{ type: 'text', text: `Error: ${result.error}` }] };
				}

				const followerNames = await this.resolveENSNames(result.followers);

				return {
					content: [
						{
							type: 'text',
							text: `Followers of ${args.addressOrName}:\\n${followerNames.join('\\n') || 'No followers found'}`,
						},
					],
				};
			}

			case 'getFollowing': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const result = await this.apiClient.getFollowing(
					args.addressOrName, 
					args.limit || 10,
					args.tags || [],
					args.search || '',
					args.sort || 'follower count'
				);
				if (result.error) {
					return { content: [{ type: 'text', text: `Error: ${result.error}` }] };
				}

				// Format results with tags if available
				const followingList = await Promise.all(
					result.following.map(async (item) => {
						const name = item.ens?.name || await this.resolveENSName(item.address);
						const tags = item.tags && item.tags.length > 0 ? ` [${item.tags.join(', ')}]` : '';
						return `${name}${tags}`;
					})
				);

				return {
					content: [
						{
							type: 'text',
							text: `${args.addressOrName} is following:\\n${followingList.join('\\n') || 'Not following anyone'}`,
						},
					],
				};
			}

			// Following/Followers checking functionality
			case 'checkFollowing': {
				if (!args?.list || !args?.following) {
					return { content: [{ type: 'text', text: 'Error: list and following are required' }] };
				}
				const result = await this.apiClient.checkFollowing(args.list, args.following);
				if (result.state.follow) {
					return { content: [{ type: 'text', text: `Following` }] };
				} else if (result.state.block) {
					return { content: [{ type: 'text', text: `Blocked` }] };
				} else if (result.state.mute) {
					return { content: [{ type: 'text', text: `Muted` }] };
				} else {
					return { content: [{ type: 'text', text: `Not following` }] };
				}
			}

			case 'checkFollower': {
				if (!args?.addressOrName || !args?.follower) {
					return { content: [{ type: 'text', text: 'Error: addressOrName and follower are required' }] };
				}
				const result = await this.apiClient.checkFollower(args.addressOrName, args.follower);
				if (result.state.follow) {
					return { content: [{ type: 'text', text: `Following` }] };
				} else if (result.state.block) {
					return { content: [{ type: 'text', text: `Blocked` }] };
				} else if (result.state.mute) {
					return { content: [{ type: 'text', text: `Muted` }] };
				} else {
					return { content: [{ type: 'text', text: `Not following` }] };
				}
			}

			// Account and profile functionality
			case 'fetchAccount': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const result = await this.apiClient.fetchAccount(args.addressOrName, args.list);
				if (!result) {
					return { content: [{ type: 'text', text: 'Error: Failed to fetch account data' }] };
				}
				return {
					content: [
						{
							type: 'text',
							text: `Account data for ${args.addressOrName}:\n${JSON.stringify(result, null, 2)}`,
						},
					],
				};
			}

			case 'fetchProfileStats': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const result = await this.apiClient.fetchProfileStats(args.addressOrName, args.list, args.isLive);
				return {
					content: [
						{
							type: 'text',
							text: `Profile stats for ${args.addressOrName}:\nFollowers: ${result.followers_count}\nFollowing: ${result.following_count}`,
						},
					],
				};
			}

			case 'fetchProfileLists': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const result = await this.apiClient.fetchProfileLists(args.addressOrName, args.fresh);
				const listsText =
					result.lists.length > 0
						? result.lists.map((l) => `List ${l.list}${l.tags ? ` (tags: ${l.tags.join(', ')})` : ''}`).join('\n')
						: 'No lists found';
				return {
					content: [
						{
							type: 'text',
							text: `Profile lists for ${args.addressOrName}:\nPrimary list: ${result.primary_list || 'None'}\nLists:\n${listsText}`,
						},
					],
				};
			}

			case 'fetchProfileBadges': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const result = await this.apiClient.fetchProfileBadges(args.addressOrName, args.list, args.fresh);
				const badgesText = result.length > 0 ? result.map((badge) => `${badge.name}: ${badge.description}`).join('\n') : 'No badges found';
				return {
					content: [
						{
							type: 'text',
							text: `Profile badges for ${args.addressOrName}:\n${badgesText}`,
						},
					],
				};
			}

			case 'fetchProfileQRCode': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const result = await this.apiClient.fetchProfileQRCode(args.addressOrName);
				if (!result) {
					return { content: [{ type: 'text', text: 'Error: Failed to fetch QR code' }] };
				}
				return {
					content: [
						{
							type: 'text',
							text: `QR code for ${args.addressOrName}:\n${result}`,
						},
					],
				};
			}

			// Advanced following/followers functionality
			case 'fetchProfileFollowing': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const params = {
					addressOrName: args.addressOrName,
					list: args.list,
					limit: args.limit || 10,
					pageParam: args.pageParam || 0,
					search: args.search,
					sort: args.sort,
					tags: args.tags,
					allResults: args.allResults,
					fresh: args.fresh,
				};
				const result = await this.apiClient.fetchProfileFollowing(params);
				const followingNames = await this.resolveENSNames(result.following);
				return {
					content: [
						{
							type: 'text',
							text: `Advanced following for ${args.addressOrName} (${result.following.length} results):\n${
								followingNames.join('\n') || 'Not following anyone'
							}`,
						},
					],
				};
			}

			case 'fetchProfileFollowers': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const params = {
					addressOrName: args.addressOrName,
					list: args.list,
					limit: args.limit || 10,
					pageParam: args.pageParam || 0,
					search: args.search,
					sort: args.sort,
					tags: args.tags,
					allResults: args.allResults,
					fresh: args.fresh,
				};
				const result = await this.apiClient.fetchProfileFollowers(params);
				const followerNames = await this.resolveENSNames(result.followers);
				return {
					content: [
						{
							type: 'text',
							text: `Advanced followers for ${args.addressOrName} (${result.followers.length} results):\n${
								followerNames.join('\n') || 'No followers found'
							}`,
						},
					],
				};
			}

			// Tags functionality
			case 'fetchFollowingTags': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const result = await this.apiClient.fetchFollowingTags(args.addressOrName, args.list, args.fresh);
				const tagsText = result.tagCounts.length > 0 ? result.tagCounts.map((tc) => `${tc.tag}: ${tc.count}`).join('\n') : 'No tags found';
				return {
					content: [
						{
							type: 'text',
							text: `Following tags for ${args.addressOrName}:\n${tagsText}`,
						},
					],
				};
			}

			case 'fetchFollowerTags': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const result = await this.apiClient.fetchFollowerTags(args.addressOrName, args.list, args.fresh);
				const tagsText = result.tagCounts.length > 0 ? result.tagCounts.map((tc) => `${tc.tag}: ${tc.count}`).join('\n') : 'No tags found';
				return {
					content: [
						{
							type: 'text',
							text: `Follower tags for ${args.addressOrName}:\n${tagsText}`,
						},
					],
				};
			}

			// Follow state functionality
			case 'fetchFollowState': {
				if (!args?.lookupAddressOrName) {
					return { content: [{ type: 'text', text: 'Error: lookupAddressOrName is required' }] };
				}
				const result = await this.apiClient.fetchFollowState(
					args.lookupAddressOrName,
					args.connectedAddress,
					args.list,
					args.type || 'following',
					args.fresh
				);
				if (!result) {
					return { content: [{ type: 'text', text: 'Error: Failed to fetch follow state' }] };
				}
				return {
					content: [
						{
							type: 'text',
							text: `Follow state for ${args.lookupAddressOrName}:\nState: ${result.state ? 'Following' : 'Not following'}${
								result.is_blocked ? '\nBlocked: Yes' : ''
							}${result.is_muted ? '\nMuted: Yes' : ''}`,
						},
					],
				};
			}

			// Notifications
			case 'fetchNotifications': {
				if (!args?.userAddress) {
					return { content: [{ type: 'text', text: 'Error: userAddress is required' }] };
				}
				const result = await this.apiClient.fetchNotifications(args.userAddress, args.interval || 'all');
				if (!result) {
					return { content: [{ type: 'text', text: 'Error: Failed to fetch notifications' }] };
				}
				return {
					content: [
						{
							type: 'text',
							text: `Notifications for ${args.userAddress} (${args.interval || 'all'}):\n${
								result.notifications.length
							} notifications found`,
						},
					],
				};
			}

			// Recommendations and discovery
			case 'fetchRecommendations': {
				if (!args?.endpoint) {
					return { content: [{ type: 'text', text: 'Error: endpoint is required' }] };
				}

				const result = await this.apiClient.fetchRecommendations(
					args.endpoint,
					args.addressOrName,
					args.list,
					args.limit || 10,
					args.pageParam || 1
				);

				const profileNames = await Promise.all(
					result.map(async (profile) => {
						if (profile.ens?.name) return profile.ens.name;
						return this.resolveENSName(profile.address);
					})
				);

				return {
					content: [
						{
							type: 'text',
							text: `${args.endpoint === 'discover' ? 'Discover' : 'Recommended'} profiles:\n${
								profileNames.join('\n') || 'No recommendations found'
							}`,
						},
					],
				};
			}

			// Leaderboard
			case 'fetchLeaderboard': {
				const params = {
					limit: args?.limit || 10,
					search: args?.search,
					filter: args?.filter,
					pageParam: args?.pageParam || 0,
					direction: args?.direction,
				};

				const result = await this.apiClient.fetchLeaderboard(params);
				const leaderboardText =
					result.results.results.length > 0
						? result.results.results
								.map((entry, index) => {
									const name = entry.ens?.name || entry.address;
									return `${index + 1}. ${name} - ${entry.followers_count} followers`;
								})
								.join('\n')
						: 'No leaderboard data found';

				return {
					content: [
						{
							type: 'text',
							text: `Leaderboard:\n${leaderboardText}`,
						},
					],
				};
			}

			// POAP
			case 'fetchPoapLink': {
				if (!args?.userAddress) {
					return { content: [{ type: 'text', text: 'Error: userAddress is required' }] };
				}

				const result = await this.apiClient.fetchPoapLink(args.userAddress);
				if (!result) {
					return { content: [{ type: 'text', text: 'Error: Failed to fetch POAP link' }] };
				}

				return {
					content: [
						{
							type: 'text',
							text: `POAP link for ${args.userAddress}:\n${result}`,
						},
					],
				};
			}

			// List state
			case 'fetchListState': {
				if (!args?.list) {
					return { content: [{ type: 'text', text: 'Error: list is required' }] };
				}

				const result = await this.apiClient.fetchListState(args.list);
				const stateText = result.length > 0 ? `${result.length} entries in list state` : 'No entries found in list state';
				return {
					content: [
						{
							type: 'text',
							text: `List state for list ${args.list}:\n${stateText}`,
						},
					],
				};
			}

			// Lists for a user
			case 'fetchListsForUser': {
				if (!args?.addressOrName) {
					return { content: [{ type: 'text', text: 'Error: addressOrName is required' }] };
				}
				const result = await this.apiClient.fetchListsForUser(args.addressOrName);
				return {
					content: [
						{
							type: 'text',
							text: `Lists for ${args.addressOrName}:\nPrimary list: ${result.primary_list}\nAll lists: ${
								(result.lists?.length || 0) > 0 ? result.lists?.join('\n') : 'No lists found'
							}`,
						},
					],
				};
			}

			// Context access tools
			case 'searchContexts': {
				if (!args?.query) {
					return { content: [{ type: 'text', text: 'Error: query is required' }] };
				}
				
				let contexts = this.contextManager.searchContexts(args.query);
				
				if (args.category) {
					contexts = contexts.filter(c => c.category === args.category);
				}
				
				if (args.tags && args.tags.length > 0) {
					contexts = contexts.filter(c => 
						c.tags?.some(tag => args.tags.includes(tag))
					);
				}

				const results = contexts.map(c => 
					`- ${c.name} (${c.id}): ${c.description}`
				).join('\n');

				return {
					content: [{
						type: 'text',
						text: results || "No contexts found matching your search"
					}]
				};
			}


			// AI Helper Tools
			case 'getBestPractices': {
				const scenario = args?.scenario || 'general';
				
				const practices = {
					'getting-started': 'FIRST: Tell Claude to "Check /tools/list in efp-mcp" to discover all 28 tools. Then try: getFollowerCount("vitalik.eth"), or searchContexts("SIWE") for documentation.',
					'tool-discovery': 'To discover tools: "Check /tools/list in efp-mcp". If tools not found, be explicit: "Use the getFollowerCount tool from efp-mcp". All 28 tools are available.',
					'tagged-users': 'ALWAYS use the efficient tag querying pattern: 1) fetchFollowingTags to get available tags, 2) getFollowing with ALL tags in the tags parameter. This is 5x faster than fetching full lists.',
					'tool-selection': 'Use getFollowerCount for basic counts, fetchProfileStats for detailed/live data, checkFollower for user-level relationships, checkFollowing for list-level relationships.',
					'performance': 'Use appropriate limits (<50 for quick queries), leverage pagination for large datasets, use isLive:true only when real-time data is needed.',
					'error-handling': 'Always normalize ENS names (add .eth if missing), validate required parameters before calling, provide fallback strategies for common failures.',
					'general': 'Use efficient tag querying for tagged users, choose right tools for the task, optimize parameters for performance, handle errors gracefully with fallbacks.'
				};
				
				return {
					content: [{
						type: 'text',
						text: `Best practices for ${scenario}:\n\n${practices[scenario] || practices.general}`
					}]
				};
			}

			case 'getUsagePattern': {
				const queryType = args?.queryType || 'unknown';
				
				const patterns = {
					'tagged-users': 'Pattern: fetchFollowingTags(user) → getFollowing(user, {tags: allTags}). Example: "Show me everyone brantly.eth has tagged" → Get tags first, then filter by all tags.',
					'relationship-check': 'Pattern: checkFollower(target, follower) for user-level. Example: "Does vitalik.eth follow brantly.eth?" → Use checkFollower directly.',
					'user-analysis': 'Pattern: fetchProfileStats(user) → fetchFollowingTags(user) → getFollowing(user, {tags: topTags}). Multi-step analysis starting with basic stats.',
					'discovery': 'Pattern: fetchRecommendations() → For each interesting user, fetchProfileStats() and getFollowing(tags: ["top8"]). Discover users then analyze their networks.',
					'performance-critical': 'Pattern: Use smallest possible limits, leverage caching, avoid allResults:true, use pagination for large datasets.'
				};
				
				return {
					content: [{
						type: 'text',
						text: `Usage pattern for ${queryType}:\n\n${patterns[queryType] || 'Specify queryType: tagged-users, relationship-check, user-analysis, discovery, or performance-critical'}`
					}]
				};
			}

			case 'getToolGuidance': {
				const task = args?.task || 'unknown';
				
				const guidance = {
					'follower-count': 'Use getFollowerCount for basic counts, fetchProfileStats for detailed stats or when you need live data (isLive:true).',
					'following-list': 'Use getFollowing for simple lists. Add tags parameter for tagged users, search parameter for finding specific users, limit for size control.',
					'relationship-check': 'Use checkFollower for "Does A follow B?" (user-level), checkFollowing for "Does list X follow Y?" (list-level).',
					'tagged-users': 'ALWAYS use efficient pattern: fetchFollowingTags first, then getFollowing with all tags. Never fetch full lists and filter locally.',
					'user-discovery': 'Use fetchRecommendations for discovery, fetchLeaderboard for top users by followers.',
					'profile-data': 'Use fetchAccount for basic info, fetchProfileStats for metrics, fetchProfileLists for owned lists.',
					'tags': 'Use fetchFollowingTags to see what tags someone uses, then getFollowing with specific tags to get tagged users.'
				};
				
				return {
					content: [{
						type: 'text',
						text: `Tool guidance for ${task}:\n\n${guidance[task] || 'Available tasks: follower-count, following-list, relationship-check, tagged-users, user-discovery, profile-data, tags'}`
					}]
				};
			}

			case 'getEfficiencyTips': {
				const area = args?.area || 'general';
				
				const tips = {
					'queries': '• Use efficient tag pattern for tagged users (5x faster)\n• Choose right tool for the task (getFollowerCount vs fetchProfileStats)\n• Use appropriate limits (default for small, pagination for large)\n• Leverage search parameters instead of local filtering',
					'parameters': '• limit: Keep <50 for quick queries, use pagination for larger\n• isLive: Only use when real-time data needed\n• tags: Always use for filtering tagged users\n• search: Use server-side search instead of local filtering',
					'performance': '• Fastest (<1s): getFollowerCount, checkFollower, checkFollowing\n• Medium (1-3s): getFollowing with filters, fetchProfileStats\n• Slower (3-5s): fetchLeaderboard, large pagination requests',
					'errors': '• Normalize ENS names (add .eth if missing)\n• Validate required parameters before calling\n• Provide fallback strategies for common failures\n• Handle "not found" gracefully with alternatives',
					'general': '• Use efficient tag querying pattern\n• Choose appropriate tools for tasks\n• Optimize parameters for performance\n• Handle errors with good fallbacks\n• Leverage server-side filtering'
				};
				
				return {
					content: [{
						type: 'text',
						text: `Efficiency tips for ${area}:\n\n${tips[area] || tips.general}`
					}]
				};
			}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	}

	async fetch(request: Request): Promise<Response> {
		// Handle CORS
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, X-Mcp-Session-Id',
				},
			});
		}

		// Handle SSE connection for MCP
		if (request.method === 'GET' && request.headers.get('accept')?.includes('text/event-stream')) {
			const { readable, writable } = new TransformStream();
			const writer = writable.getWriter();
			const encoder = new TextEncoder();
			const newSessionId = crypto.randomUUID();

			const sendSSE = async (data: any) => {
				const message = `data: ${JSON.stringify(data)}\\n\\n`;
				await writer.write(encoder.encode(message));
			};

			await sendSSE({
				jsonrpc: '2.0',
				method: 'connection/ready',
				params: { sessionId: newSessionId },
			});

			const keepAlive = setInterval(async () => {
				try {
					await writer.write(encoder.encode(':keepalive\\n\\n'));
				} catch {
					clearInterval(keepAlive);
				}
			}, 30000);

			request.signal.addEventListener('abort', () => {
				clearInterval(keepAlive);
				writer.close().catch(() => {});
			});

			return new Response(readable, {
				status: 200,
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',
					'Access-Control-Allow-Origin': '*',
					'X-Mcp-Session-Id': newSessionId,
				},
			});
		}

		// Handle POST requests - use the Server's transport
		if (request.method === 'POST') {
			const requestData = (await request.json()) as { method?: string; id?: string | number; params?: any };

			// Create a basic JSON-RPC response for MCP tools
			try {
				console.log('POST request received:', JSON.stringify(requestData, null, 2));

				if (requestData.method === 'tools/list') {
					return new Response(
						JSON.stringify({
							jsonrpc: '2.0',
							id: requestData.id,
							result: {
								tools: [
									// Basic tools
									{ name: 'getFollowerCount', description: 'Get follower/following count' },
									{
										name: 'getFollowers',
										description:
											'Get list of followers with filters (tags, search, sort) and sorting (earliest first, latest first, follower count)',
									},
									{
										name: 'getFollowing',
										description:
											'Get list of following with filters (tags, search, sort) and sorting (earliest first, latest first, follower count)',
									},

									// Following/Followers checking
									{ name: 'checkFollowing', description: 'Check if one list follows an address/ENS name' },
									{ name: 'checkFollower', description: 'Check if an address/ENS name follows another' },

									// Account and profile
									{ name: 'fetchAccount', description: 'Get account info with ENS data' },
									{ name: 'fetchProfileStats', description: 'Get detailed profile statistics' },
									{ name: 'fetchProfileLists', description: 'Get EFP lists owned by an address' },
									{ name: 'fetchProfileBadges', description: 'Get POAP badges' },
									{ name: 'fetchProfileQRCode', description: 'Get QR code for profile' },

									// Advanced following/followers
									{ name: 'fetchProfileFollowing', description: 'Advanced following with filters' },
									{ name: 'fetchProfileFollowers', description: 'Advanced followers with filters' },

									// Tags
									{ name: 'fetchFollowingTags', description: 'Get tags for following' },
									{ name: 'fetchFollowerTags', description: 'Get tags for followers' },

									// Follow state
									{ name: 'fetchFollowState', description: 'Get follow state between addresses' },

									// Notifications
									{ name: 'fetchNotifications', description: 'Get user notifications' },

									// Recommendations
									{ name: 'fetchRecommendations', description: 'Get recommended profiles' },

									// Leaderboard
									{ name: 'fetchLeaderboard', description: 'Get top users by followers' },

									// POAP
									{ name: 'fetchPoapLink', description: 'Get POAP link' },

									// List state
									{ name: 'fetchListState', description: 'Export EFP list state' },

									// Context access tools
									{ name: 'searchContexts', description: 'Search across all available usage contexts and documentation' },

									// AI helper tools
									{ name: 'getBestPractices', description: 'Get best practices for specific EFP MCP usage scenarios' },
									{ name: 'getUsagePattern', description: 'Get optimal usage patterns for common queries' },
									{ name: 'getToolGuidance', description: 'Get guidance on selecting the right tool for specific tasks' },
									{ name: 'getEfficiencyTips', description: 'Get performance optimization tips for EFP MCP usage' },
								],
							},
						}),
						{
							status: 200,
							headers: {
								'Content-Type': 'application/json',
								'Access-Control-Allow-Origin': '*',
							},
						}
					);
				}

				if (requestData.method === 'tools/call') {
					console.log('tools/call received with params:', requestData.params);
					try {
						const result = await this.handleMCPRequest(requestData as any);
						return new Response(
							JSON.stringify({
								jsonrpc: '2.0',
								id: requestData.id,
								result,
							}),
							{
								status: 200,
								headers: {
									'Content-Type': 'application/json',
									'Access-Control-Allow-Origin': '*',
								},
							}
						);
					} catch (innerError) {
						console.error('Error in handleMCPRequest:', innerError);
						throw innerError;
					}
				}

				return new Response(
					JSON.stringify({
						jsonrpc: '2.0',
						id: requestData.id,
						error: { code: -32601, message: 'Method not found' },
					}),
					{
						status: 200,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					}
				);
			} catch (error) {
				return new Response(
					JSON.stringify({
						jsonrpc: '2.0',
						id: requestData.id || null,
						error: {
							code: -32603,
							message: 'Internal error',
							data: error instanceof Error ? error.message : 'Unknown error',
						},
					}),
					{
						status: 200,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					}
				);
			}
		}

		// Test endpoint
		if (request.url.includes('/test')) {
			try {
				const result = await this.apiClient.getFollowers('brantly.eth', 3);
				return new Response(JSON.stringify({ success: true, result }), {
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				});
			} catch (error) {
				return new Response(
					JSON.stringify({
						success: false,
						error: error instanceof Error ? error.message : 'Unknown error',
						stack: error instanceof Error ? error.stack : undefined,
					}),
					{
						status: 200,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					}
				);
			}
		}

		// Default response for GET requests
		return new Response(
			JSON.stringify({
				name: 'EFP MCP Server',
				version: '1.0.0',
				description: 'MCP server for EFP API and documentation contexts',
				endpoints: {
					'GET /': 'SSE endpoint for MCP (with Accept: text/event-stream)',
					'POST /': 'MCP JSON-RPC endpoint',
					'GET /test': 'Test endpoint for debugging',
				},
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			}
		);
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			const mcp = new EFPMCPServer(env);
			await mcp.init();
			return mcp.fetch(request);
		} catch (error) {
			return new Response(
				JSON.stringify({
					error: 'Initialization failed',
					message: error instanceof Error ? error.message : 'Unknown error',
					stack: error instanceof Error ? error.stack : undefined,
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				}
			);
		}
	},
};
