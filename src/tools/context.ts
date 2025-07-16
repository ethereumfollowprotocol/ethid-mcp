import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { allContexts, getContextsByCategory } from '../contexts/index';
import { Env } from '../types/env';

export function registerContextTools(server: McpServer, env: Env) {
	// searchContexts tool
	server.tool(
		'searchContexts',
		'Search through EFP documentation and context information by keywords and categories. Use specific keywords for better results.',
		{
			query: z.string().describe('Search query for documentation (e.g., "EFP API", "ENS resolution", "getFollowers")'),
			category: z.string().optional().describe('Filter by category: "protocols" (EFP, ENS, EIK, SIWE), "usage" (guides, patterns), "technical" (architecture, API)'),
		},
		async ({ query, category }) => {
			try {
				let contexts = allContexts;
				if (category) {
					contexts = getContextsByCategory(category);
				}

				const queryLower = query.toLowerCase();
				const searchTerms = queryLower.split(' ').filter(term => term.length > 2);
				
				// Score-based relevance matching
				const matchedContexts = contexts.map(ctx => {
					let score = 0;
					const nameLower = ctx.name.toLowerCase();
					const descriptionLower = ctx.description.toLowerCase();
					const contentLower = ctx.content.toLowerCase();
					const tagsLower = ctx.tags?.map(tag => tag.toLowerCase()) || [];
					
					// Exact matches get highest score
					if (nameLower.includes(queryLower)) score += 100;
					if (descriptionLower.includes(queryLower)) score += 80;
					if (contentLower.includes(queryLower)) score += 40;
					if (tagsLower.some(tag => tag.includes(queryLower))) score += 60;
					
					// Partial matches for individual terms
					searchTerms.forEach(term => {
						if (nameLower.includes(term)) score += 20;
						if (descriptionLower.includes(term)) score += 15;
						if (contentLower.includes(term)) score += 10;
						if (tagsLower.some(tag => tag.includes(term))) score += 12;
					});
					
					return { ...ctx, score };
				}).filter(ctx => ctx.score > 0);

				// Sort by relevance score and limit results
				const sortedMatches = matchedContexts
					.sort((a, b) => b.score - a.score)
					.slice(0, 10); // Limit to top 10 results

				if (sortedMatches.length === 0) {
					const suggestions = category ? 
						`Try searching without category filter, or use broader terms.` :
						`Try using category filters: "protocols", "usage", or "technical". Or search for specific terms like "EFP", "ENS", "API", "quickstart".`;
					
					return {
						content: [{
							type: 'text',
							text: `No results found for "${query}". ${suggestions}`,
						}],
					};
				}

				// Group results by relevance
				const highRelevance = sortedMatches.filter(ctx => ctx.score >= 50);
				const mediumRelevance = sortedMatches.filter(ctx => ctx.score >= 20 && ctx.score < 50);
				const lowRelevance = sortedMatches.filter(ctx => ctx.score < 20);

				const formatResults = (contexts: any[], title: string) => {
					if (contexts.length === 0) return '';
					return `## ${title}\n\n${contexts.map(ctx => 
						`📄 **${ctx.name}**\n${ctx.description}\n\n${ctx.content}`
					).join('\n\n---\n\n')}\n\n`;
				};

				const content = [
					formatResults(highRelevance, 'Most Relevant'),
					formatResults(mediumRelevance, 'Related'),
					formatResults(lowRelevance, 'Additional Results')
				].filter(section => section).join('');

				return {
					content: [{
						type: 'text',
						text: `Found ${sortedMatches.length} results for "${query}"${category ? ` in category "${category}"` : ''}:\n\n${content}`,
					}],
				};
			} catch (error) {
				return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }] };
			}
		}
	);
}
