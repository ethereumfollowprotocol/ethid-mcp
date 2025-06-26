import type {
	CheckFollowingResponse,
	FollowersListResponse,
	FollowingListResponse,
	ApiError,
	ProfileStats,
	FollowingResponse,
	FollowerResponse,
	ProfileBadge,
	ProfileLists,
	FollowState,
	TagsResponse,
	NotificationsResponse,
	DiscoverProfile,
	LeaderboardResponse,
	InfiniteQueryProps,
	StatsResponse,
	ProfileListsResponse,
} from '../types/api';

export class EFPAPIClient {
	private baseUrl: string;
	private headers: HeadersInit;

	constructor(baseUrl: string = 'https://api.ethfollow.xyz/api/v1') {
		this.baseUrl = baseUrl;
		this.headers = {
			'Content-Type': 'application/json',
		};
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			const error: ApiError = {
				error: `API request failed with status ${response.status}`,
				statusCode: response.status,
			};

			try {
				const errorData = (await response.json()) as { message?: string; error?: string };
				error.message = errorData.message || errorData.error;
			} catch {
				error.message = response.statusText;
			}

			throw error;
		}

		return response.json();
	}

	private formatQueryParams(inputs: Record<string, string | number | string[] | null | undefined>): string {
		return Object.entries(inputs)
			.filter(([, value]) => !!value)
			.map(([param, value]) => {
				if (Array.isArray(value) && value.length > 0) {
					return `${param}=${value.join(',')}`;
				}
				return `${param}=${value}`;
			})
			.join('&');
	}

	// Basic follower/following functionality
	async getFollowerCount(addressOrName: string): Promise<StatsResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(addressOrName)}/stats`, { headers: this.headers });
			return this.handleResponse<StatsResponse>(response);
		} catch (error) {
			console.error(`Failed to get follower count for ${addressOrName}:`, error);
			return { followers_count: 0, following_count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
		}
	}

	async checkFollowing(list: number, following: string): Promise<CheckFollowingResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/lists/${list}/${following}/buttonState`, { headers: this.headers });
			return this.handleResponse<CheckFollowingResponse>(response);
		} catch (error) {
			console.error(`Failed to check following relationship:`, error);
			return { state: { follow: false, block: false, mute: false } };
		}
	}

	async checkFollower(addressOrName: string, follower: string): Promise<CheckFollowingResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/users/${addressOrName}/${follower}/followerState`, { headers: this.headers });
			return this.handleResponse<CheckFollowingResponse>(response);
		} catch (error) {
			console.error(`Failed to check follower relationship:`, error);
			return { state: { follow: false, block: false, mute: false } };
		}
	}

	async getFollowers(
		addressOrName: string,
		limit: number = 10,
		tags: string[] = [],
		search: string = '',
		sort: string = 'follower count'
	): Promise<FollowersListResponse> {
		try {
			const queryParams = this.formatQueryParams({
				limit: limit,
				tags: tags,
				term: search,
				sort: sort
					? {
							'earliest first': 'earliest',
							'latest first': 'latest',
							'follower count': 'followers',
					  }[sort]
					: undefined,
			});
			const followersEndpoint = search && search?.length > 0 ? 'searchFollowers' : 'followers';
			const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(addressOrName)}/${followersEndpoint}?${queryParams}`, {
				headers: this.headers,
			});
			return this.handleResponse<FollowersListResponse>(response);
		} catch (error) {
			console.error(`Failed to get followers for ${addressOrName}:`, error);
			return { followers: [], error: error instanceof Error ? error.message : 'Unknown error' };
		}
	}

	async getFollowing(
		addressOrName: string,
		limit: number = 10,
		tags: string[] = [],
		search: string = '',
		sort: string = 'follower count'
	): Promise<FollowingListResponse> {
		try {
			const queryParams = this.formatQueryParams({
				limit: limit,
				tags: tags,
				term: search,
				sort: sort
					? {
							'earliest first': 'earliest',
							'latest first': 'latest',
							'follower count': 'followers',
					  }[sort]
					: undefined,
			});
			const followingEndpoint = search && search?.length > 0 ? 'searchFollowing' : 'following';
			const response = await fetch(`${this.baseUrl}/users/${encodeURIComponent(addressOrName)}/${followingEndpoint}?${queryParams}`, {
				headers: this.headers,
			});
			return this.handleResponse<FollowingListResponse>(response);
		} catch (error) {
			console.error(`Failed to get following for ${addressOrName}:`, error);
			return { following: [], error: error instanceof Error ? error.message : 'Unknown error' };
		}
	}

	// Account and profile functionality
	async fetchAccount(addressOrName: string, list?: number | null) {
		try {
			const url = `${this.baseUrl}/${list !== undefined ? 'lists' : 'users'}/${list ?? addressOrName}/account`;
			const response = await fetch(url, { headers: this.headers });
			return this.handleResponse(response);
		} catch (error) {
			console.error(`Failed to fetch account for ${addressOrName}:`, error);
			return null;
		}
	}

	async fetchProfileStats(addressOrName: string, list?: number | string, isLive?: boolean): Promise<ProfileStats> {
		try {
			const url = `${this.baseUrl}${list !== undefined ? `/lists/${list}` : `/users/${addressOrName}`}/stats${
				isLive ? '?live=true&cache=fresh' : ''
			}`;

			const response = await fetch(url, { headers: this.headers });
			return this.handleResponse<ProfileStats>(response);
		} catch (error) {
			console.error(`Failed to fetch profile stats for ${addressOrName}:`, error);
			return { followers_count: 0, following_count: 0 };
		}
	}

	async fetchProfileLists(addressOrName: string, fresh?: boolean): Promise<ProfileLists> {
		try {
			const url = `${this.baseUrl}/users/${addressOrName}/lists${fresh ? '?cache=fresh' : ''}`;
			const response = await fetch(url, { headers: this.headers });
			return this.handleResponse<ProfileLists>(response);
		} catch (error) {
			console.error(`Failed to fetch profile lists for ${addressOrName}:`, error);
			return { primary_list: null, lists: [] };
		}
	}

	async fetchProfileBadges(addressOrName: string, list?: number | null, fresh?: boolean): Promise<ProfileBadge[]> {
		try {
			const url = `${this.baseUrl}/${list === undefined ? 'users' : 'lists'}/${list ?? addressOrName}/badges${fresh ? '?cache=fresh' : ''}`;

			const response = await fetch(url, { headers: this.headers });
			const data = await this.handleResponse<{ poaps: ProfileBadge[] }>(response);
			return data.poaps || [];
		} catch (error) {
			console.error(`Failed to fetch profile badges for ${addressOrName}:`, error);
			return [];
		}
	}

	async fetchProfileQRCode(addressOrName: string): Promise<string | null> {
		try {
			const url = `${this.baseUrl}/users/${addressOrName}/qr`;
			const response = await fetch(url, { headers: this.headers });
			return response.text();
		} catch (error) {
			console.error(`Failed to fetch profile QR code for ${addressOrName}:`, error);
			return null;
		}
	}

	// Following/Followers detailed functionality
	async fetchProfileFollowing(params: InfiniteQueryProps): Promise<{ following: FollowingResponse[]; nextPageParam: number }> {
		try {
			const queryParams = this.formatQueryParams({
				limit: params.limit,
				offset: params.pageParam * params.limit,
				tags: params.tags,
				term: params.search,
				sort: params.sort
					? {
							'earliest first': 'earliest',
							'latest first': 'latest',
							'follower count': 'followers',
					  }[params.sort]
					: undefined,
				cache: params.fresh ? 'fresh' : undefined,
			});

			const followingEndpoint = params.allResults
				? 'allFollowing'
				: params.search && params.search?.length >= 2
				? 'searchFollowing'
				: 'following';

			const url = `${this.baseUrl}/${params.list === undefined ? 'users' : 'lists'}/${
				params.list ?? params.addressOrName
			}/${followingEndpoint}?${queryParams}`;

			const response = await fetch(url, { headers: this.headers });
			const data = await this.handleResponse<{ following: FollowingResponse[] }>(response);

			return {
				following: data.following ?? [],
				nextPageParam: params.pageParam + 1,
			};
		} catch (error) {
			console.error(`Failed to fetch profile following:`, error);
			return { following: [], nextPageParam: params.pageParam + 1 };
		}
	}

	async fetchProfileFollowers(params: InfiniteQueryProps): Promise<{ followers: FollowerResponse[]; nextPageParam: number }> {
		try {
			const queryParams = this.formatQueryParams({
				limit: params.limit,
				offset: params.pageParam * params.limit,
				term: params.search,
				sort: params.sort
					? {
							'earliest first': 'earliest',
							'latest first': 'latest',
							'follower count': 'followers',
					  }[params.sort]
					: undefined,
				tags: params.tags,
			});

			const followersEndpoint = params.allResults
				? 'allFollowers'
				: params.search && params.search?.length >= 2
				? 'searchFollowers'
				: 'followers';

			const url = `${this.baseUrl}/${params.list === undefined ? 'users' : 'lists'}/${
				params.list ?? params.addressOrName
			}/${followersEndpoint}?${queryParams}`;

			const response = await fetch(url, { headers: this.headers });
			const data = await this.handleResponse<{ followers: FollowerResponse[] }>(response);

			return {
				followers: data.followers ?? [],
				nextPageParam: params.pageParam + 1,
			};
		} catch (error) {
			console.error(`Failed to fetch profile followers:`, error);
			return { followers: [], nextPageParam: params.pageParam + 1 };
		}
	}

	// Tags functionality
	async fetchFollowingTags(addressOrName: string, list?: number | string, fresh?: boolean): Promise<TagsResponse> {
		try {
			const url = `${this.baseUrl}/${list === undefined ? 'users' : 'lists'}/${list ?? addressOrName}/tags${fresh ? '?cache=fresh' : ''}`;

			const response = await fetch(url, { headers: this.headers });
			return this.handleResponse<TagsResponse>(response);
		} catch (error) {
			console.error(`Failed to fetch following tags:`, error);
			return { token_id: 0, tags: [], tagCounts: [], taggedAddresses: [] };
		}
	}

	async fetchFollowerTags(addressOrName: string, list?: number | string, fresh?: boolean): Promise<TagsResponse> {
		try {
			const url = `${this.baseUrl}/${list === undefined ? 'users' : 'lists'}/${list ?? addressOrName}/followerTags${
				fresh ? '?cache=fresh' : ''
			}`;

			const response = await fetch(url, { headers: this.headers });
			return this.handleResponse<TagsResponse>(response);
		} catch (error) {
			console.error(`Failed to fetch follower tags:`, error);
			return { token_id: 0, tags: [], tagCounts: [], taggedAddresses: [] };
		}
	}

	// Follow state functionality
	async fetchFollowState(
		lookupAddressOrName: string,
		connectedAddress?: string,
		list?: number | string,
		type: 'following' | 'followers' = 'following',
		fresh?: boolean
	): Promise<FollowState | null> {
		try {
			if ((!list && type === 'following') || !(connectedAddress || list)) return null;

			const url = `${this.baseUrl}/${list === undefined ? 'users' : 'lists'}/${list ?? connectedAddress}/${lookupAddressOrName}/${
				type === 'following' ? 'buttonState' : 'followerState'
			}${fresh ? '?cache=fresh' : ''}`;

			const response = await fetch(url, { headers: this.headers });
			return this.handleResponse<FollowState>(response);
		} catch (error) {
			console.error(`Failed to fetch follow state:`, error);
			return null;
		}
	}

	// Notifications
	async fetchNotifications(
		userAddress?: string,
		interval: 'hour' | 'day' | 'week' | 'month' | 'all' = 'all'
	): Promise<NotificationsResponse | null> {
		if (!userAddress) return null;

		try {
			const url = `${this.baseUrl}/users/${userAddress}/notifications?limit=1000&interval=${interval}`;
			const response = await fetch(url, { headers: this.headers });
			return this.handleResponse<NotificationsResponse>(response);
		} catch (error) {
			console.error(`Failed to fetch notifications:`, error);
			return null;
		}
	}

	// Recommendations and discovery
	async fetchRecommendations(
		endpoint: 'discover' | 'recommended',
		addressOrName?: string,
		list?: number,
		limit = 10,
		pageParam = 1
	): Promise<DiscoverProfile[]> {
		try {
			const url = `${this.baseUrl}/${
				endpoint === 'recommended' && addressOrName
					? `${list === undefined ? 'users' : 'lists'}/${list ?? addressOrName}/recommended?limit=${limit}&offset=${pageParam * limit}`
					: `${endpoint}?limit=${limit}&offset=${pageParam * limit}`
			}`;

			const response = await fetch(url, { headers: this.headers });
			const data = await this.handleResponse<{ recommended?: DiscoverProfile[]; latestFollows?: DiscoverProfile[] }>(response);

			return endpoint === 'recommended' ? data.recommended || [] : data.latestFollows || [];
		} catch (error) {
			console.error(`Failed to fetch recommendations:`, error);
			return [];
		}
	}

	// Leaderboard
	async fetchLeaderboard(params: {
		limit: number;
		search?: string;
		filter?: string;
		pageParam: number;
		direction?: string;
	}): Promise<{ results: LeaderboardResponse; nextPageParam: number; prevPageParam: number }> {
		try {
			const queryParams = this.formatQueryParams({
				limit: params.limit,
				offset: params.pageParam * params.limit,
				sort: params.filter,
				direction: params.direction,
			});

			const url = `${this.baseUrl}/leaderboard/${params.search && params.search.length > 2 ? 'search' : 'ranked'}?${queryParams}&term=${
				params.search || ''
			}`;

			const response = await fetch(url, { headers: this.headers });
			const data = await this.handleResponse<LeaderboardResponse>(response);

			return {
				results: data,
				nextPageParam: params.pageParam + 1,
				prevPageParam: params.pageParam > 0 ? params.pageParam - 1 : 0,
			};
		} catch (error) {
			console.error(`Failed to fetch leaderboard:`, error);
			return {
				results: { last_updated: 0, results: [] },
				nextPageParam: params.pageParam + 1,
				prevPageParam: params.pageParam > 0 ? params.pageParam - 1 : 0,
			};
		}
	}

	// POAP
	async fetchPoapLink(userAddress: string): Promise<string | undefined> {
		try {
			const response = await fetch(`${this.baseUrl}/users/${userAddress}/poap`, { headers: this.headers });
			const data = await this.handleResponse<{ link: string }>(response);
			return data.link;
		} catch (error) {
			console.error(`Failed to fetch POAP link:`, error);
			return undefined;
		}
	}

	// List state
	async fetchListState(list: number): Promise<FollowingResponse[]> {
		try {
			const response = await fetch(`${this.baseUrl}/exportState/${list}`, { headers: this.headers });
			const data = await this.handleResponse<{ following: FollowingResponse[] }>(response);
			return data.following;
		} catch (error) {
			console.error(`Failed to fetch list state:`, error);
			return [];
		}
	}

	// Fetch lists for a user
	async fetchListsForUser(addressOrName: string): Promise<ProfileListsResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/users/${addressOrName}/lists`, { headers: this.headers });
			const data = await this.handleResponse<ProfileListsResponse>(response);
			return data;
		} catch (err: unknown) {
			return {
				primary_list: null,
				lists: [],
			} as ProfileListsResponse;
		}
	}
}
