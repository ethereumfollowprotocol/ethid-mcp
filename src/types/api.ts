export interface StatsResponse {
	followers_count: number;
	following_count: number;
	error?: string;
}

export interface CheckFollowingResponse {
	token_id?: string;
	address?: `0x${string}`;
	state: {
		follow: boolean;
		block: boolean;
		mute: boolean;
	};
}

export interface FollowersListResponse {
	followers: FollowerResponse[];
	total?: number;
	hasMore?: boolean;
	error?: string;
}

export interface FollowingListResponse {
	following: FollowingResponse[];
	total?: number;
	hasMore?: boolean;
	error?: string;
}

export interface ApiError {
	error: string;
	message?: string;
	statusCode?: number;
}

// Additional types for comprehensive API coverage
export interface ProfileStats {
	followers_count: number;
	following_count: number;
}

export interface FollowingResponse {
	address: string;
	ens?: {
		name: string;
		avatar?: string;
	};
	tags?: string[];
	is_blocked?: boolean;
	is_muted?: boolean;
}

export interface FollowerResponse {
	address: string;
	ens?: {
		name: string;
		avatar?: string;
	};
	tags?: string[];
	is_blocked?: boolean;
	is_muted?: boolean;
}

export interface ProfileBadge {
	name: string;
	description: string;
	image: string;
	tokenId?: string;
	event?: {
		name: string;
		description: string;
	};
}

export interface ProfileRole {
	isOwner: boolean;
	isManager: boolean;
	isUser: boolean;
	listChainId: number;
	listRecordsContract: string;
	listSlot: bigint;
}

export interface ListInfo {
	list: number;
	tags?: string[];
}

export interface ProfileLists {
	primary_list: number | null;
	lists: ListInfo[];
}

export interface FollowState {
	state: boolean;
	is_blocked?: boolean;
	is_muted?: boolean;
}

export interface TagsResponse {
	token_id: number;
	tags: string[];
	tagCounts: Array<{ tag: string; count: number }>;
	taggedAddresses: string[];
}

export interface NotificationItem {
	type: string;
	timestamp: number;
	data: any;
}

export interface NotificationsResponse {
	notifications: NotificationItem[];
}

export interface DiscoverProfile {
	address: string;
	ens?: {
		name: string;
		avatar?: string;
	};
	followers_count?: number;
	following_count?: number;
}

export interface LeaderboardEntry {
	address: string;
	ens?: {
		name: string;
		avatar?: string;
	};
	followers_count: number;
	following_count: number;
	rank?: number;
}

export interface LeaderboardResponse {
	last_updated: number;
	results: LeaderboardEntry[];
}

export interface ENSDomain {
	name: string;
	resolvedAddress: { id: string } | null;
}

export interface SearchENSResults {
	domains: ENSDomain[];
}

export interface InfiniteQueryProps {
	addressOrName?: string;
	list?: number | string;
	limit: number;
	pageParam: number;
	sort?: string;
	tags?: string[];
	search?: string;
	allResults?: boolean;
	fresh?: boolean;
	filter?: string;
	direction?: string;
}

export interface ProfileListsResponse {
	primary_list?: string | null;
	lists?: string[];
}
