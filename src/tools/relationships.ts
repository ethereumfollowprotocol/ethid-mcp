import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CheckFollowingResponse, CheckFollowerResponse, ProfileLists } from '../types/api';

export function registerRelationshipTools(server: McpServer, baseUrl: string) {
	// checkFollowing tool
	server.tool(
		'checkFollowing',
		{
			list: z.number().optional().describe('List number to check'),
			addressOrName: z.string().optional().describe('Address or ENS name to check'),
			following: z.string().describe('Address or ENS name to check if being followed'),
		},
		async ({ list, addressOrName, following }) => {
			let selectedList = list;

			// If user with no list is provided, fetch the lists and use the primary list/first list
			if (!list && addressOrName) {
				const response = await fetch(`${baseUrl}/users/${encodeURIComponent(addressOrName)}/lists`);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const data = (await response.json()) as ProfileLists;
				selectedList = data.primary_list || data.lists[0].list;
				if (!selectedList) {
					return {
						content: [{ type: 'text', text: 'User has no lists' }],
					};
				}
			}

			try {
				const response = await fetch(`${baseUrl}/lists/${selectedList}/${encodeURIComponent(following)}/buttonState`);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const data = (await response.json()) as CheckFollowingResponse;

				const state = Object.keys(data.state).find((key) => data.state[key as keyof typeof data.state]) || 'none';
				const text =
					{
						follow: 'Following',
						block: 'Blocking',
						mute: 'Muting',
						none: 'Not following',
					}[state] || 'Not following';

				return {
					content: [
						{
							type: 'text',
							text: `${addressOrName} is ${text} ${following}`,
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);

	// checkFollower tool
	server.tool(
		'checkFollower',
		{
			addressOrName: z.string().describe('Address or ENS name to check follower state'),
			follower: z.string().describe('Address or ENS name to check if following'),
		},
		async ({ addressOrName, follower }) => {
			try {
				const response = await fetch(`${baseUrl}/users/${encodeURIComponent(addressOrName)}/${encodeURIComponent(follower)}/followerState`);
				if (!response.ok) {
					throw new Error(`API Error: ${response.status} ${response.statusText}`);
				}
				const data = (await response.json()) as CheckFollowerResponse;

				const state = Object.keys(data.state).find((key) => data.state[key as keyof typeof data.state]) || 'none';
				const text =
					{
						follow: 'Followed',
						block: 'Blocked',
						mute: 'Muted',
						none: 'Not following',
					}[state] || 'Not following';

				return {
					content: [
						{
							type: 'text',
							text: `${addressOrName} is ${text} by ${follower}`,
						},
					],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);

	// // fetchFollowState tool
	// server.tool(
	// 	'fetchFollowState',
	// 	{
	// 		lookupAddressOrName: z.string().describe('Address or ENS name to lookup'),
	// 		connectedAddress: z.string().optional().describe('Connected address'),
	// 		list: z.number().optional().describe('Optional list ID'),
	// 		type: z.string().optional().describe('Type of follow state to check'),
	// 		fresh: z.boolean().optional().describe('Whether to fetch fresh data'),
	// 	},
	// 	async ({ lookupAddressOrName, connectedAddress, list, type, fresh }) => {
	// 		try {
	// 			const url = new URL(`${baseUrl}/users/${lookupAddressOrName}/followState`);
	// 			if (connectedAddress) url.searchParams.append('connectedAddress', connectedAddress);
	// 			if (list) url.searchParams.append('list', list.toString());
	// 			if (type) url.searchParams.append('type', type);
	// 			if (fresh) url.searchParams.append('fresh', 'true');

	// 			const response = await fetch(url);
	// 			if (!response.ok) {
	// 				throw new Error(`API Error: ${response.status} ${response.statusText}`);
	// 			}
	// 			const state = await response.json();

	// 			return {
	// 				content: [
	// 					{
	// 						type: 'text',
	// 						text: JSON.stringify(state, null, 2),
	// 					},
	// 				],
	// 			};
	// 		} catch (error) {
	// 			return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
	// 		}
	// 	}
	// );
}
