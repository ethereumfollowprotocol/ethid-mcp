import { WorkerEntrypoint } from 'cloudflare:workers';
import { AccountResponse, FollowerResponse, FollowingResponse, StatsResponse } from './types/api';
import { allContexts, getContextsByCategory, getContextsByTags } from './contexts/index';
import { createDynamicContexts, dynamicContexts } from './contexts/dynamic';

export interface Env {
	EFP_API_URL?: string;
	EFP_API_KEY?: string;
	CONTEXT_KV?: any;
	EFP_GOOGLE_DOC_ID?: string;
}

export default class EFPMCPWorker extends WorkerEntrypoint<Env> {
	private baseUrl: string;

	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		this.baseUrl = env.EFP_API_URL || 'https://api.ethfollow.xyz/api/v1';
	}

	/**
	 * Get the number of followers and following for an ENS name or Ethereum address.
	 * @param addressOrName {string} ENS name (e.g., 'brantly.eth') or Ethereum address
	 * @return {object} Follower and following counts with ENS name if available
	 */
	async getFollowerCount(params: { addressOrName: string }) {
		const { addressOrName } = params;
		try {
			const statsResponse = await fetch(`${this.baseUrl}/users/${addressOrName}/stats`);
			if (!statsResponse.ok) {
				throw new Error(`API Error: ${statsResponse.status} ${statsResponse.statusText}`);
			}
			const stats = (await statsResponse.json()) as StatsResponse;

			const accountResponse = await fetch(`${this.baseUrl}/users/${addressOrName}/account`);
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

	/**
	 * Get a list of followers for an ENS name or Ethereum address.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @param limit {number} Number of followers to return (default: 10)
	 * @param tags {string[]} Tags to filter by
	 * @param search {string} Search term to filter results
	 * @param sort {string} Sort order: 'earliest first', 'latest first', or 'follower count' (default)
	 * @return {object} List of followers with their details
	 */
	async getFollowers(params: { addressOrName: string; limit?: number; tags?: string[]; search?: string; sort?: string }) {
		const { addressOrName, limit = 10, tags, search, sort = 'follower count' } = params;
		try {
			// Use searchFollowers endpoint if search term is provided
			const followersEndpoint = search && search.length > 0 ? 'searchFollowers' : 'followers';
			const url = new URL(`${this.baseUrl}/users/${encodeURIComponent(addressOrName)}/${followersEndpoint}`);

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
			const data = await response.json();

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
							followerList.map((f) => `${f.ens || f.address} ${f.tags?.length ? ` [${f.tags.join(', ')}]` : ''}`).join('\n') ||
							'No followers found'
						}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get a list of accounts an ENS name or Ethereum address is following.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @param limit {number} Number of following to return (default: 10)
	 * @param tags {string[]} Tags to filter by
	 * @param search {string} Search term to filter results
	 * @param sort {string} Sort order: 'earliest first', 'latest first', or 'follower count' (default)
	 * @return {object} List of following with their details
	 */
	async getFollowing(params: { addressOrName: string; limit?: number; offset?: number; tags?: string[]; search?: string; sort?: string }) {
		const { addressOrName, limit = 10, offset = 0, tags, search, sort = 'follower count' } = params;
		try {
			// Use searchFollowing endpoint if search term is provided
			const followingEndpoint = search && search.length > 0 ? 'searchFollowing' : 'following';
			const url = new URL(`${this.baseUrl}/users/${encodeURIComponent(addressOrName)}/${followingEndpoint}`);

			url.searchParams.append('limit', limit.toString());
			if (offset > 0) url.searchParams.append('offset', offset.toString());
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
			const data = (await response.json()) as { following: FollowingResponse[] };

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
							followingList.map((f) => `${f.ens || f.address} ${f.tags?.length ? ` [${f.tags.join(', ')}]` : ''}`).join('\n') ||
							'Not following anyone'
						}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Search through EFP documentation and protocol guides.
	 * @param query {string} Search query for documentation
	 * @param category {string} Filter by category (protocols, usage, technical)
	 * @return {object} Matching documentation contexts
	 */
	async searchContexts(params: { query: string; category?: string }) {
		const { query, category } = params;
		
		try {
			// Fetch dynamic contexts (pass env for Cloudflare Workers)
			const dynamicContextsArray = await createDynamicContexts(this.env);
			
			// Combine static and dynamic contexts
			const allAvailableContexts = [...allContexts, ...dynamicContexts, ...dynamicContextsArray];
			
			// Get contexts based on category if specified
			const contextsToSearch = category 
				? allAvailableContexts.filter(context => context.category === category)
				: allAvailableContexts;
			
			const lowerQuery = query.toLowerCase();
			const matches = contextsToSearch
				.filter(context => {
					const matchesQuery = 
						context.id.toLowerCase().includes(lowerQuery) ||
						context.name.toLowerCase().includes(lowerQuery) ||
						context.description?.toLowerCase().includes(lowerQuery) ||
						context.content?.toLowerCase().includes(lowerQuery) ||
						context.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
					return matchesQuery;
				})
				.map(context => ({
					id: context.id,
					name: context.name,
					description: context.description,
					category: context.category,
					tags: context.tags,
					content: context.content ? context.content.substring(0, 500) + (context.content.length > 500 ? '...' : '') : 'No content available'
				}));

			return {
				content: [
					{
						type: 'text',
						text: matches.length > 0 
							? matches.map((m) => `**${m.name}** (${m.category})\n${m.description}\nTags: ${m.tags?.join(', ') || 'None'}\n\n${m.content}\n---`).join('\n')
							: `No contexts found matching "${query}"${category ? ` in category "${category}"` : ''}`,
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error searching contexts: ${error instanceof Error ? error.message : 'Unknown error'}`,
					},
				],
			};
		}
	}

	/**
	 * Check if one list follows another.
	 * @param list {number} List ID to check
	 * @param following {string} Address or ENS name to check if being followed
	 * @return {object} Follow status result
	 */
	async checkFollowing(params: { list: number; following: string }) {
		const { list, following } = params;
		try {
			const response = await fetch(`${this.baseUrl}/lists/${list}/${encodeURIComponent(following)}/buttonState`);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: data.state?.follow ? 'Following' : 'Not following',
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Check if an address/ENS name follows another.
	 * @param addressOrName {string} Address or ENS name to check follower state
	 * @param follower {string} Address or ENS name to check if following
	 * @return {object} Follower status result
	 */
	async checkFollower(params: { addressOrName: string; follower: string }) {
		const { addressOrName, follower } = params;
		try {
			const response = await fetch(
				`${this.baseUrl}/users/${encodeURIComponent(addressOrName)}/${encodeURIComponent(follower)}/followerState`
			);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			if (data.state.follow) {
				return { content: [{ type: 'text', text: 'Following' }] };
			} else if (data.state.block) {
				return { content: [{ type: 'text', text: 'Blocked' }] };
			} else if (data.state.mute) {
				return { content: [{ type: 'text', text: 'Muted' }] };
			} else {
				return { content: [{ type: 'text', text: 'Not following' }] };
			}
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get account info with ENS data.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @param list {number} Optional list ID
	 * @return {object} Account information
	 */
	async fetchAccount(params: { addressOrName: string; list?: number }) {
		const { addressOrName, list } = params;
		try {
			const baseEndpoint = list === undefined ? 'users' : 'lists';
			const identifier = list ?? addressOrName;
			const url = new URL(`${this.baseUrl}/${baseEndpoint}/${encodeURIComponent(identifier)}/account`);

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Account info for ${addressOrName}:\n${JSON.stringify(data, null, 2)}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get detailed profile statistics.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @param list {number} Optional list ID
	 * @param isLive {boolean} Whether to get live data
	 * @return {object} Profile statistics
	 */
	async fetchProfileStats(params: { addressOrName: string; list?: number; isLive?: boolean }) {
		const { addressOrName, list, isLive } = params;
		try {
			const baseEndpoint = list === undefined ? 'users' : 'lists';
			const identifier = list ?? addressOrName;
			const url = new URL(`${this.baseUrl}/${baseEndpoint}/${encodeURIComponent(identifier)}/stats`);
			if (isLive) {
				url.searchParams.append('live', 'true');
				url.searchParams.append('cache', 'fresh');
			}

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Profile stats for ${addressOrName}:\nFollowers: ${data.followers_count || 0}\nFollowing: ${data.following_count || 0}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get EFP lists owned by an address.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @param fresh {boolean} Whether to fetch fresh data
	 * @return {object} EFP lists
	 */
	async fetchProfileLists(params: { addressOrName: string; fresh?: boolean }) {
		const { addressOrName, fresh } = params;
		try {
			const url = new URL(`${this.baseUrl}/users/${encodeURIComponent(addressOrName)}/lists`);
			if (fresh) url.searchParams.append('cache', 'fresh');

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Lists for ${addressOrName}:\n${data.lists?.map((l) => `- List ${l.id}`).join('\n') || 'No lists found'}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get POAP badges for a profile.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @param list {number} Optional list ID
	 * @param fresh {boolean} Whether to fetch fresh data
	 * @return {object} POAP badges
	 */
	async fetchProfileBadges(params: { addressOrName: string; list?: number; fresh?: boolean }) {
		const { addressOrName, list, fresh } = params;
		try {
			const baseEndpoint = list === undefined ? 'users' : 'lists';
			const identifier = list ?? addressOrName;
			const url = new URL(`${this.baseUrl}/${baseEndpoint}/${encodeURIComponent(identifier)}/badges`);
			if (fresh) url.searchParams.append('cache', 'fresh');

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Badges for ${addressOrName}:\n${data.length > 0 ? data.map((b) => `- ${b.name}`).join('\n') : 'No badges found'}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get QR code for profile.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @return {object} QR code data
	 */
	async fetchProfileQRCode(params: { addressOrName: string }) {
		const { addressOrName } = params;
		try {
			const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(addressOrName)}/qr`);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.text();
			return {
				content: [
					{
						type: 'text',
						text: `QR code for ${addressOrName}: ${data}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Advanced following with filters.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @param list {number} Optional list ID
	 * @param limit {number} Number of results to return
	 * @param pageParam {number} Page number for pagination
	 * @param search {string} Search term to filter results
	 * @param sort {string} Sort order
	 * @param tags {string[]} Tags to filter by
	 * @param allResults {boolean} Whether to get all results
	 * @param fresh {boolean} Whether to fetch fresh data
	 * @return {object} Advanced following data
	 */
	async fetchProfileFollowing(params: {
		addressOrName: string;
		list?: number;
		limit?: number;
		pageParam?: number;
		search?: string;
		sort?: string;
		tags?: string[];
		allResults?: boolean;
		fresh?: boolean;
	}) {
		const { addressOrName, list, limit = 10, pageParam = 0, search, sort, tags, allResults, fresh } = params;
		try {
			// Choose endpoint based on conditions
			const followingEndpoint = allResults ? 'allFollowing' : search && search.length >= 2 ? 'searchFollowing' : 'following';

			const baseEndpoint = list === undefined ? 'users' : 'lists';
			const identifier = list ?? addressOrName;
			const url = new URL(`${this.baseUrl}/${baseEndpoint}/${encodeURIComponent(identifier)}/${followingEndpoint}`);

			url.searchParams.append('limit', limit.toString());
			url.searchParams.append('offset', (pageParam * limit).toString());
			if (search) url.searchParams.append('term', search);
			if (sort) {
				const sortMap = {
					'earliest first': 'earliest',
					'latest first': 'latest',
					'follower count': 'followers',
				};
				url.searchParams.append('sort', sortMap[sort as keyof typeof sortMap] || sort);
			}
			if (tags?.length) url.searchParams.append('tags', tags.join(','));
			if (fresh) url.searchParams.append('cache', 'fresh');

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Advanced following data retrieved for ${addressOrName}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Advanced followers with filters.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @param list {number} Optional list ID
	 * @param limit {number} Number of results to return
	 * @param pageParam {number} Page number for pagination
	 * @param search {string} Search term to filter results
	 * @param sort {string} Sort order
	 * @param tags {string[]} Tags to filter by
	 * @param allResults {boolean} Whether to get all results
	 * @param fresh {boolean} Whether to fetch fresh data
	 * @return {object} Advanced followers data
	 */
	async fetchProfileFollowers(params: {
		addressOrName: string;
		list?: number;
		limit?: number;
		pageParam?: number;
		search?: string;
		sort?: string;
		tags?: string[];
		allResults?: boolean;
		fresh?: boolean;
	}) {
		const { addressOrName, list, limit = 10, pageParam = 0, search, sort, tags, allResults, fresh } = params;
		try {
			// Choose endpoint based on conditions
			const followersEndpoint = allResults ? 'allFollowers' : search && search.length >= 2 ? 'searchFollowers' : 'followers';

			const baseEndpoint = list === undefined ? 'users' : 'lists';
			const identifier = list ?? addressOrName;
			const url = new URL(`${this.baseUrl}/${baseEndpoint}/${encodeURIComponent(identifier)}/${followersEndpoint}`);

			url.searchParams.append('limit', limit.toString());
			url.searchParams.append('offset', (pageParam * limit).toString());
			if (search) url.searchParams.append('term', search);
			if (sort) {
				const sortMap = {
					'earliest first': 'earliest',
					'latest first': 'latest',
					'follower count': 'followers',
				};
				url.searchParams.append('sort', sortMap[sort as keyof typeof sortMap] || sort);
			}
			if (tags?.length) url.searchParams.append('tags', tags.join(','));
			if (fresh) url.searchParams.append('cache', 'fresh');

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Advanced followers data retrieved for ${addressOrName}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get tags for following.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @param list {number} Optional list ID
	 * @param fresh {boolean} Whether to fetch fresh data
	 * @return {object} Following tags
	 */
	async fetchFollowingTags(params: { addressOrName: string; list?: number; fresh?: boolean }) {
		const { addressOrName, list, fresh } = params;
		try {
			const baseEndpoint = list === undefined ? 'users' : 'lists';
			const identifier = list ?? addressOrName;
			const url = new URL(`${this.baseUrl}/${baseEndpoint}/${encodeURIComponent(identifier)}/tags`);
			if (fresh) url.searchParams.append('cache', 'fresh');

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Following tags retrieved for ${addressOrName}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get tags for followers.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @param list {number} Optional list ID
	 * @param fresh {boolean} Whether to fetch fresh data
	 * @return {object} Follower tags
	 */
	async fetchFollowerTags(params: { addressOrName: string; list?: number; fresh?: boolean }) {
		const { addressOrName, list, fresh } = params;
		try {
			const baseEndpoint = list === undefined ? 'users' : 'lists';
			const identifier = list ?? addressOrName;
			const url = new URL(`${this.baseUrl}/${baseEndpoint}/${encodeURIComponent(identifier)}/followerTags`);
			if (fresh) url.searchParams.append('cache', 'fresh');

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Follower tags retrieved for ${addressOrName}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get follow state between addresses.
	 * @param lookupAddressOrName {string} Address or ENS name to lookup
	 * @param connectedAddress {string} Connected address
	 * @param list {number} Optional list ID
	 * @param type {string} Type of follow state to check
	 * @param fresh {boolean} Whether to fetch fresh data
	 * @return {object} Follow state information
	 */
	async fetchFollowState(params: {
		lookupAddressOrName: string;
		connectedAddress?: string;
		list?: number;
		type?: string;
		fresh?: boolean;
	}) {
		const { lookupAddressOrName, connectedAddress, list, type = 'following', fresh } = params;
		try {
			if ((!list && type === 'following') || !(connectedAddress || list)) {
				return { content: [{ type: 'text', text: 'Error: Missing required parameters' }] };
			}

			const baseEndpoint = list === undefined ? 'users' : 'lists';
			const identifier = list ?? connectedAddress;
			const endpoint = type === 'following' ? 'buttonState' : 'followerState';
			const url = new URL(
				`${this.baseUrl}/${baseEndpoint}/${encodeURIComponent(identifier)}/${encodeURIComponent(lookupAddressOrName)}/${endpoint}`
			);
			if (fresh) url.searchParams.append('cache', 'fresh');

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Follow state retrieved for ${lookupAddressOrName}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get user notifications.
	 * @param userAddress {string} User address
	 * @param interval {string} Time interval for notifications
	 * @return {object} User notifications
	 */
	async fetchNotifications(params: { userAddress: string; interval?: string }) {
		const { userAddress, interval = 'all' } = params;
		try {
			const url = new URL(`${this.baseUrl}/users/${encodeURIComponent(userAddress)}/notifications`);
			url.searchParams.append('limit', '1000');
			url.searchParams.append('interval', interval);

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Notifications retrieved for ${userAddress}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get recommended profiles.
	 * @param endpoint {string} Recommendation endpoint to use
	 * @param addressOrName {string} ENS name or Ethereum address (for recommended endpoint)
	 * @param list {number} Optional list ID
	 * @param limit {number} Number of recommendations to return
	 * @param pageParam {number} Page number for pagination
	 * @return {object} Recommended profiles
	 */
	async fetchRecommendations(params: { endpoint: string; addressOrName?: string; list?: number; limit?: number; pageParam?: number }) {
		const { endpoint, addressOrName, list, limit = 10, pageParam = 1 } = params;
		try {
			const url = new URL(
				`${this.baseUrl}/${
					endpoint === 'recommended' && addressOrName
						? `${list === undefined ? 'users' : 'lists'}/${encodeURIComponent(list?.toString() ?? addressOrName)}/recommended`
						: endpoint
				}`
			);
			url.searchParams.append('limit', limit.toString());
			url.searchParams.append('offset', (pageParam * limit).toString());

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Recommendations retrieved from ${endpoint} endpoint`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get top users by followers.
	 * @param limit {number} Number of results to return
	 * @param search {string} Search term
	 * @param filter {string} Filter criteria
	 * @param pageParam {number} Page number for pagination
	 * @param direction {string} Sort direction
	 * @return {object} Leaderboard data
	 */
	async fetchLeaderboard(params: { limit?: number; search?: string; filter?: string; pageParam?: number; direction?: string }) {
		const { limit = 10, search, filter, pageParam = 0, direction } = params;
		try {
			const endpoint = search && search.length > 2 ? 'search' : 'ranked';
			const url = new URL(`${this.baseUrl}/leaderboard/${endpoint}`);
			url.searchParams.append('limit', limit.toString());
			url.searchParams.append('offset', (pageParam * limit).toString());
			if (filter) url.searchParams.append('sort', filter);
			if (direction) url.searchParams.append('direction', direction);
			if (search) url.searchParams.append('term', search);

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `Leaderboard data retrieved`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get POAP link.
	 * @param userAddress {string} User address
	 * @return {object} POAP link
	 */
	async fetchPoapLink(params: { userAddress: string }) {
		const { userAddress } = params;
		try {
			const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(userAddress)}/poap`);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `POAP link retrieved for ${userAddress}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Export EFP list state.
	 * @param list {number} List ID to export
	 * @return {object} List state data
	 */
	async fetchListState(params: { list: number }) {
		const { list } = params;
		try {
			const response = await fetch(`${this.baseUrl}/exportState/${list}`);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `List state exported for list ${list}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get a primary list and all lists for a user.
	 * @param addressOrName {string} ENS name or Ethereum address
	 * @return {object} User lists
	 */
	async fetchListsForUser(params: { addressOrName: string }) {
		const { addressOrName } = params;
		try {
			const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(addressOrName)}/lists`);
			if (!response.ok) {
				throw new Error(`API Error: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();
			return {
				content: [
					{
						type: 'text',
						text: `All lists retrieved for ${addressOrName}`,
					},
				],
			};
		} catch (error) {
			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
		}
	}

	/**
	 * Get best practices for specific EFP MCP usage scenarios.
	 * @param scenario {string} Usage scenario
	 * @return {object} Best practices guidance
	 */
	async getBestPractices(params: { scenario?: string }) {
		const { scenario } = params;
		const practices = {
			general:
				'Use getFollowerCount for quick stats, getFollowers/getFollowing for detailed data. Always check for ENS names when available.',
			filtering:
				'Use tags and search parameters to filter results. Sort by follower count for popular accounts, by latest first for recent activity.',
			performance: 'Use pagination with pageParam for large datasets. Set appropriate limits to avoid timeouts.',
			'error-handling': 'Always check for error responses. Network issues are common with blockchain APIs.',
		};

		const selected = scenario && practices[scenario] ? practices[scenario] : practices['general'];
		return {
			content: [
				{
					type: 'text',
					text: `Best practices for ${scenario || 'general'} scenario:\n\n${selected}`,
				},
			],
		};
	}

	/**
	 * Get optimal usage patterns for common queries.
	 * @param queryType {string} Type of query pattern needed
	 * @return {object} Usage pattern guidance
	 */
	async getUsagePattern(params: { queryType?: string }) {
		const { queryType } = params;
		const patterns = {
			'social-analysis': 'Start with getFollowerCount, then use getFollowers/getFollowing with tags for deeper analysis.',
			discovery: 'Use fetchRecommendations with discover endpoint, then fetchLeaderboard for popular accounts.',
			'relationship-check': 'Use checkFollowing or checkFollower for specific relationships, fetchFollowState for comprehensive status.',
			'bulk-analysis': 'Use fetchProfileFollowing/fetchProfileFollowers with pagination for large datasets.',
		};

		const selected = queryType && patterns[queryType] ? patterns[queryType] : 'Use appropriate tools based on your specific needs.';
		return {
			content: [
				{
					type: 'text',
					text: `Usage pattern for ${queryType || 'general'} queries:\n\n${selected}`,
				},
			],
		};
	}

	/**
	 * Get guidance on selecting the right tool for specific tasks.
	 * @param task {string} Task description
	 * @return {object} Tool selection guidance
	 */
	async getToolGuidance(params: { task?: string }) {
		const { task } = params;
		const guidance = {
			'follower-count': 'Use getFollowerCount for basic statistics',
			'follower-list': 'Use getFollowers or fetchProfileFollowers for detailed follower information',
			'following-list': 'Use getFollowing or fetchProfileFollowing for detailed following information',
			'profile-info': 'Use fetchAccount for basic profile data, fetchProfileStats for detailed statistics',
			'relationship-check': 'Use checkFollowing or checkFollower for specific relationships',
			recommendations: 'Use fetchRecommendations for account discovery',
			leaderboard: 'Use fetchLeaderboard for top users by follower count',
		};

		const taskLower = task?.toLowerCase() || '';
		const matchedGuidance =
			Object.entries(guidance).find(([key]) => taskLower.includes(key.replace('-', ' ')))?.[1] ||
			'Describe your specific task for personalized tool recommendations.';

		return {
			content: [
				{
					type: 'text',
					text: `Tool guidance for task "${task || 'general'}":\n\n${matchedGuidance}`,
				},
			],
		};
	}

	/**
	 * Get performance optimization tips for EFP MCP usage.
	 * @param area {string} Performance area to optimize
	 * @return {object} Efficiency tips
	 */
	async getEfficiencyTips(params: { area?: string }) {
		const { area } = params;
		const tips = {
			'api-calls': 'Minimize API calls by using appropriate limits and caching results locally when possible.',
			pagination: 'Use pagination (pageParam) for large datasets instead of fetching all results at once.',
			filtering: 'Apply filters (tags, search) at the API level rather than filtering large result sets locally.',
			caching: 'Cache frequently accessed data like follower counts and profile information.',
			'rate-limiting': 'Implement rate limiting to avoid hitting API limits, especially for bulk operations.',
		};

		const selected = area && tips[area] ? tips[area] : 'Focus on minimizing API calls and using appropriate pagination.';
		return {
			content: [
				{
					type: 'text',
					text: `Efficiency tips for ${area || 'general'} optimization:\n\n${selected}`,
				},
			],
		};
	}

	/**
	 * @ignore
	 */
	async fetch(request: Request): Promise<Response> {
		try {
			const url = new URL(request.url);

			// Handle CORS preflight
			if (request.method === 'OPTIONS') {
				return new Response(null, {
					status: 200,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
						'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					},
				});
			}

			// Only handle POST requests
			if (request.method !== 'POST') {
				return new Response('Method not allowed', { status: 405 });
			}

			// Extract method name from URL path
			const methodName = url.pathname.slice(1); // Remove leading '/'

			if (!methodName) {
				return new Response('Method name required in URL path', { status: 400 });
			}

			// Parse request body as method arguments
			let args = {};
			try {
				args = await request.json();
			} catch (error) {
				// If parsing fails, assume no arguments
			}

			// Check if method exists on this class
			if (typeof (this as any)[methodName] !== 'function') {
				return new Response(`Method ${methodName} not found`, { status: 404 });
			}

			// Call the method with arguments as object or individual parameters
			let result;
			try {
				// Check if the method expects parameters in order or as an object
				const method = (this as any)[methodName];
				// Pass the args object directly to the method
				result = await method.call(this, args);
			} catch (error) {
				return new Response(
					JSON.stringify({
						error: error instanceof Error ? error.message : 'Unknown error',
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

			// Return the result
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
				},
			});
		} catch (error) {
			return new Response(
				JSON.stringify({
					error: error instanceof Error ? error.message : 'Unknown error',
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
	}
}
