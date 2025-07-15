import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { allContexts, getContextsByCategory } from '../contexts/index';
import { createDynamicContexts, dynamicContexts } from '../contexts/dynamic';
import { Env } from '../types/env';

export function registerContextTools(server: McpServer, env: Env) {
	// searchContexts tool
	server.tool(
		'searchContexts',
		{
			query: z.string().describe('Search query for documentation'),
			category: z.string().optional().describe('Filter by category (protocols, usage, technical)'),
		},
		async ({ query, category }) => {
			try {
				const dynamicCtx = await createDynamicContexts(env);
				const allAvailableContexts = [...allContexts, ...dynamicCtx, ...dynamicContexts];

				let contexts = allAvailableContexts;
				if (category) {
					contexts = getContextsByCategory(category);
				}

				const queryLower = query.toLowerCase();
				const matches = contexts.filter(
					(ctx) =>
						ctx.name.toLowerCase().includes(queryLower) ||
						ctx.description.toLowerCase().includes(queryLower) ||
						ctx.content.toLowerCase().includes(queryLower) ||
						ctx.tags?.some((tag) => tag.toLowerCase().includes(queryLower))
				);

				return {
					content: matches.map((ctx) => ({
						type: 'text',
						text: `📄 ${ctx.name}\n${ctx.description}\n\n${ctx.content}`,
					})),
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);
}