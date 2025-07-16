import { McpAgent } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Env } from './types/env';
import { registerAllTools } from './tools';

// Define our MCP agent with EFP tools
export class EFPMCPAgent extends McpAgent {
	private envvars: Env;

	server = new McpServer({
		name: 'ETHID MCP',
		version: '1.0.0',
	});

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
		this.envvars = env;
	}

	async init() {
		// Register all tools using the modular tool system
		registerAllTools(this.server, this.envvars);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === '/sse' || url.pathname === '/sse/message') {
			return EFPMCPAgent.serveSSE('/sse').fetch(request, env, ctx);
		}

		if (url.pathname === '/mcp') {
			return EFPMCPAgent.serve('/mcp').fetch(request, env, ctx);
		}

		return new Response('Not found', { status: 404 });
	},
};
