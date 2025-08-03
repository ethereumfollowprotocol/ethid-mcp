import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Env } from '../types/env';
import { registerProfileTools } from './profile';
import { registerAccountTools } from './account';
import { registerRelationshipTools } from './relationships';
import { registerTagTools } from './tags';
import { registerDiscoveryTools } from './discovery';
import { registerListTools } from './lists';
import { registerContextTools } from './context';
import { registerGuidanceTools } from './guidance';
import { registerChatGPTTools } from './chatgpt';

export function registerAllTools(server: McpServer, env: Env) {
	const baseUrl = env.EFP_API_URL || 'https://api.ethfollow.xyz/api/v1';
	const ensWorkerUrl = env.ENS_WORKER_URL || 'https://ens.ethfollow.xyz';

	// Register ChatGPT compatibility tools first (required: search and fetch)
	registerChatGPTTools(server, baseUrl, ensWorkerUrl);

	// Register all other tool categories
	registerProfileTools(server, baseUrl);
	registerAccountTools(server, baseUrl, ensWorkerUrl);
	registerRelationshipTools(server, baseUrl);
	registerTagTools(server, baseUrl);
	registerDiscoveryTools(server, baseUrl);
	registerListTools(server, baseUrl);
	registerContextTools(server, env);
	registerGuidanceTools(server);
}