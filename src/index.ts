import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { EthFollowApiClient } from "./utils/api-client";
import { ContextManager } from "./utils/context-manager";
import { ContextLoader } from "./utils/context-loader";
import { 
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema,
  PingRequestSchema,
  type JSONRPCMessage,
  type CallToolRequest,
  type ListResourcesRequest,
  type ReadResourceRequest,
  type InitializeRequest
} from "@modelcontextprotocol/sdk/types.js";

export interface Env {
  EFP_API_URL?: string;
  EFP_API_KEY?: string;
  CONTEXT_KV?: any; // Cloudflare KV namespace for storing contexts
}

export class EthFollowMCP {
  server: Server;
  mcpServer: McpServer;

  env: Env;
  apiClient: EthFollowApiClient;
  contextManager: ContextManager;

  constructor(env: Env) {
    this.env = env;
    // EthFollowApiClient expects the full API URL
    const baseUrl = env.EFP_API_URL || "https://api.ethfollow.xyz/api/v1";
    this.apiClient = new EthFollowApiClient(baseUrl);
    // Don't auto-load contexts, we'll load them in init()
    this.contextManager = new ContextManager(false);
    
    // Create the low-level server
    this.server = new Server({
      name: "ethfollow-mcp",
      version: "1.0.0"
    });
    
    // Create the high-level MCP server wrapper
    this.mcpServer = new McpServer({
      name: "ethfollow-mcp",
      version: "1.0.0"
    });
  }

  async init() {
    // Load contexts from various sources
    // 1. Always load from built-in modules
    ContextLoader.loadFromModules(this.contextManager);
    
    // 2. Optionally load from KV if available
    if (this.env.CONTEXT_KV) {
      await ContextLoader.loadFromKV(this.contextManager, this.env.CONTEXT_KV);
    }

    // Register EthFollow API tools
    this.mcpServer.tool(
      "getFollowerCount",
      "Get the number of followers for an ENS name",
      {
        ensName: z.string().describe("ENS name (e.g., 'brantly.eth')")
      },
      async ({ ensName }) => {
        const result = await this.apiClient.getFollowerCount(ensName);
        
        if (result.error) {
          return {
            content: [{
              type: "text",
              text: `Error getting follower count for ${ensName}: ${result.error}`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: `${ensName} has ${result.count} followers`
          }]
        };
      }
    );

    this.mcpServer.tool(
      "checkFollowing",
      "Check if one ENS name follows another",
      {
        follower: z.string().describe("ENS name of the follower"),
        following: z.string().describe("ENS name of the account being followed")
      },
      async ({ follower, following }) => {
        const result = await this.apiClient.checkFollowing(follower, following);
        
        if (result.error) {
          return {
            content: [{
              type: "text",
              text: `Error checking following relationship: ${result.error}`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: result.isFollowing 
              ? `Yes, ${follower} follows ${following}`
              : `No, ${follower} does not follow ${following}`
          }]
        };
      }
    );

    this.mcpServer.tool(
      "getFollowers",
      "Get a list of followers for an ENS name",
      {
        ensName: z.string().describe("ENS name to get followers for"),
        limit: z.number().optional().default(10).describe("Number of followers to return")
      },
      async ({ ensName, limit = 10 }) => {
        const result = await this.apiClient.getFollowers(ensName, limit);
        
        if (result.error) {
          return {
            content: [{
              type: "text",
              text: `Error getting followers for ${ensName}: ${result.error}`
            }]
          };
        }

        const followersList = result.followers.length > 0 
          ? result.followers.join('\n')
          : 'No followers found';

        return {
          content: [{
            type: "text",
            text: `Followers of ${ensName}:\n${followersList}`
          }]
        };
      }
    );

    this.mcpServer.tool(
      "getFollowing",
      "Get a list of accounts an ENS name is following",
      {
        ensName: z.string().describe("ENS name to get following list for"),
        limit: z.number().optional().default(10).describe("Number of following to return")
      },
      async ({ ensName, limit = 10 }) => {
        const result = await this.apiClient.getFollowing(ensName, limit);
        
        if (result.error) {
          return {
            content: [{
              type: "text",
              text: `Error getting following for ${ensName}: ${result.error}`
            }]
          };
        }

        const followingList = result.following.length > 0
          ? result.following.join('\n')
          : 'Not following anyone';

        return {
          content: [{
            type: "text",
            text: `${ensName} is following:\n${followingList}`
          }]
        };
      }
    );

    // Register context tools
    this.mcpServer.tool(
      "searchContexts",
      "Search through available context files",
      {
        query: z.string().describe("Search query"),
        category: z.string().optional().describe("Filter by category"),
        tags: z.array(z.string()).optional().describe("Filter by tags")
      },
      async ({ query, category, tags }) => {
        let contexts = this.contextManager.searchContexts(query);
        
        if (category) {
          contexts = contexts.filter(c => c.category === category);
        }
        
        if (tags && tags.length > 0) {
          contexts = contexts.filter(c => 
            c.tags?.some(tag => tags.includes(tag))
          );
        }

        const results = contexts.map(c => 
          `- ${c.name} (${c.id}): ${c.description}`
        ).join('\n');

        return {
          content: [{
            type: "text",
            text: results || "No contexts found matching your search"
          }]
        };
      }
    );

    this.mcpServer.tool(
      "searchFileContext",
      "Search within a specific large context file",
      {
        contextId: z.string().describe("ID of the context file to search"),
        query: z.string().describe("Search query")
      },
      async ({ contextId, query }) => {
        const results = await this.contextManager.searchFileContext(contextId, query);
        
        if (results.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No results found for "${query}" in context "${contextId}"`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: `Search results for "${query}" in ${contextId}:\n\n${results.join('\n\n---\n\n')}`
          }]
        };
      }
    );

    this.mcpServer.tool(
      "getFileMetadata",
      "Get metadata about a large context file",
      {
        contextId: z.string().describe("ID of the context file")
      },
      async ({ contextId }) => {
        const metadata = await this.contextManager.getFileMetadata(contextId);
        
        if (!metadata) {
          return {
            content: [{
              type: "text",
              text: `File context "${contextId}" not found`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: `Metadata for ${contextId}:
- Lines: ${metadata.lines.toLocaleString()}
- Characters: ${metadata.characters.toLocaleString()}
- Available sections: ${metadata.sections.join(', ') || 'None'}`
          }]
        };
      }
    );

    this.mcpServer.tool(
      "getFileSection",
      "Get a specific section from a large context file",
      {
        contextId: z.string().describe("ID of the context file"),
        section: z.string().describe("Section name to retrieve")
      },
      async ({ contextId, section }) => {
        const sectionContent = await this.contextManager.getFileContextSection(contextId, section);
        
        if (!sectionContent) {
          return {
            content: [{
              type: "text",
              text: `Section "${section}" not found in context "${contextId}"`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: `Section "${section}" from ${contextId}:\n\n${sectionContent}`
          }]
        };
      }
    );

    // Register resources for contexts
    const allContexts = this.contextManager.getAllContexts();
    const allFileContexts = this.contextManager.getAllFileContexts();
    
    // Register regular context resources
    allContexts.forEach(context => {
      this.mcpServer.resource(
        `context-${context.id}`,
        `context://${context.id}`,
        {
          name: context.name,
          description: context.description,
          mimeType: context.mimeType || "text/markdown"
        },
        async (uri) => ({
          contents: [{
            uri: uri.href,
            mimeType: context.mimeType || "text/markdown",
            text: context.content
          }]
        })
      );
    });

    // Register file context resources  
    allFileContexts.forEach(config => {
      this.mcpServer.resource(
        `file-context-${config.id}`,
        `context://${config.id}`,
        {
          name: config.name,
          description: config.description,
          mimeType: "text/plain"
        },
        async (uri) => {
          const fileContext = await this.contextManager.getFileContext(config.id);
          return {
            contents: [{
              uri: uri.href,
              mimeType: "text/plain",
              text: fileContext?.content || "Context not found"
            }]
          };
        }
      );
    });
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

    // Handle MCP protocol
    const url = new URL(request.url);
    const sessionId = request.headers.get('x-mcp-session-id');
    
    // Handle SSE connection for MCP
    if (request.method === 'GET' && request.headers.get('accept')?.includes('text/event-stream')) {
      // Create a TransformStream for SSE
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();
      const newSessionId = crypto.randomUUID();

      // Function to send SSE events
      const sendSSE = async (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        await writer.write(encoder.encode(message));
      };

      // Send initial connection event
      await sendSSE({
        jsonrpc: "2.0",
        method: "connection/ready",
        params: {
          sessionId: newSessionId
        }
      });

      // Keep the connection alive
      const keepAlive = setInterval(async () => {
        try {
          await writer.write(encoder.encode(':keepalive\n\n'));
        } catch {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        writer.close().catch(() => {});
      });

      return new Response(readable, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'X-Mcp-Session-Id': newSessionId,
        },
      });
    }

    // Handle POST requests for MCP messages
    if (request.method === 'POST') {
      try {
        const body = await request.text();
        const message = JSON.parse(body) as JSONRPCMessage;
        
        // Handle different methods directly
        let response: any;
        
        switch (message.method) {
          case 'initialize':
            response = {
              jsonrpc: "2.0",
              id: message.id,
              result: {
                protocolVersion: "1.0.0",
                serverInfo: {
                  name: "ethfollow-mcp",
                  version: "1.0.0"
                },
                capabilities: {
                  tools: true,
                  resources: true
                }
              }
            };
            break;
            
          case 'tools/list':
            response = {
              jsonrpc: "2.0",
              id: message.id,
              result: {
                tools: [
                  {
                    name: "getFollowerCount",
                    description: "Get the number of followers for an ENS name",
                    inputSchema: {
                      type: "object",
                      properties: {
                        ensName: { type: "string", description: "ENS name (e.g., 'brantly.eth')" }
                      },
                      required: ["ensName"]
                    }
                  },
                  {
                    name: "checkFollowing",
                    description: "Check if one ENS name follows another",
                    inputSchema: {
                      type: "object",
                      properties: {
                        follower: { type: "string", description: "ENS name of the follower" },
                        following: { type: "string", description: "ENS name of the account being followed" }
                      },
                      required: ["follower", "following"]
                    }
                  },
                  {
                    name: "getFollowers",
                    description: "Get a list of followers for an ENS name",
                    inputSchema: {
                      type: "object",
                      properties: {
                        ensName: { type: "string", description: "ENS name to get followers for" },
                        limit: { type: "number", description: "Number of followers to return", default: 10 }
                      },
                      required: ["ensName"]
                    }
                  },
                  {
                    name: "getFollowing",
                    description: "Get a list of accounts an ENS name is following",
                    inputSchema: {
                      type: "object",
                      properties: {
                        ensName: { type: "string", description: "ENS name to get following list for" },
                        limit: { type: "number", description: "Number of following to return", default: 10 }
                      },
                      required: ["ensName"]
                    }
                  },
                  {
                    name: "getRecommendations",
                    description: "Get recommended profiles to follow",
                    inputSchema: {
                      type: "object",
                      properties: {
                        ensName: { type: "string", description: "ENS name to get recommendations for (optional)" },
                        limit: { type: "number", description: "Number of recommendations to return", default: 10 }
                      }
                    }
                  },
                  {
                    name: "getLeaderboard",
                    description: "Get the top users by follower count",
                    inputSchema: {
                      type: "object",
                      properties: {
                        limit: { type: "number", description: "Number of users to return", default: 10 },
                        search: { type: "string", description: "Search term (optional)" }
                      }
                    }
                  },
                  {
                    name: "searchENS",
                    description: "Search for ENS names",
                    inputSchema: {
                      type: "object",
                      properties: {
                        query: { type: "string", description: "Search query" }
                      },
                      required: ["query"]
                    }
                  },
                  {
                    name: "searchContexts",
                    description: "Search through available context files",
                    inputSchema: {
                      type: "object",
                      properties: {
                        query: { type: "string", description: "Search query" },
                        category: { type: "string", description: "Filter by category (optional)" },
                        tags: { type: "array", items: { type: "string" }, description: "Filter by tags (optional)" }
                      },
                      required: ["query"]
                    }
                  },
                  {
                    name: "searchFileContext",
                    description: "Search within a specific large context file (efp, eik, ens, siwe)",
                    inputSchema: {
                      type: "object",
                      properties: {
                        contextId: { type: "string", description: "ID of the context file (efp, eik, ens, siwe)" },
                        query: { type: "string", description: "Search query" }
                      },
                      required: ["contextId", "query"]
                    }
                  },
                  {
                    name: "getFileMetadata",
                    description: "Get metadata about a large context file",
                    inputSchema: {
                      type: "object",
                      properties: {
                        contextId: { type: "string", description: "ID of the context file (efp, eik, ens, siwe)" }
                      },
                      required: ["contextId"]
                    }
                  },
                  {
                    name: "getFileSection",
                    description: "Get a specific section from a large context file",
                    inputSchema: {
                      type: "object",
                      properties: {
                        contextId: { type: "string", description: "ID of the context file (efp, eik, ens, siwe)" },
                        section: { type: "string", description: "Section name to retrieve" }
                      },
                      required: ["contextId", "section"]
                    }
                  }
                ]
              }
            };
            break;
            
          case 'tools/call':
            const toolName = (message.params as any).name;
            const args = (message.params as any).arguments || {};
            
            try {
              let result: any;
              
              switch (toolName) {
                case 'getFollowerCount':
                  try {
                    // Direct fetch to test the API
                    const apiUrl = `https://api.ethfollow.xyz/api/v1/users/${encodeURIComponent(args.ensName)}/stats`;
                    const response = await fetch(apiUrl, {
                      headers: {
                        'Content-Type': 'application/json',
                      }
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json() as { followers_count: number; following_count: number };
                    
                    result = {
                      content: [{
                        type: "text",
                        text: `${args.ensName} has ${data.followers_count} followers`
                      }]
                    };
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `API Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                case 'checkFollowing':
                  try {
                    const params = new URLSearchParams({
                      follower: args.follower,
                      following: args.following,
                    });
                    const apiUrl = `https://api.ethfollow.xyz/api/v1/following/check?${params}`;
                    const response = await fetch(apiUrl, {
                      headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json() as { isFollowing: boolean };
                    
                    result = {
                      content: [{
                        type: "text",
                        text: data.isFollowing 
                          ? `Yes, ${args.follower} follows ${args.following}`
                          : `No, ${args.follower} does not follow ${args.following}`
                      }]
                    };
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `API Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                case 'getFollowers':
                  try {
                    const limit = args.limit || 10;
                    const apiUrl = `https://api.ethfollow.xyz/api/v1/users/${encodeURIComponent(args.ensName)}/followers?limit=${limit}`;
                    const response = await fetch(apiUrl, {
                      headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json() as { followers: Array<{ address: string; ens?: { name: string } }> };
                    const followerNames = data.followers.map(f => f.ens?.name || f.address);
                    
                    result = {
                      content: [{
                        type: "text",
                        text: `Followers of ${args.ensName}:\n${followerNames.join('\n') || 'No followers found'}`
                      }]
                    };
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `API Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                case 'getFollowing':
                  try {
                    const limit = args.limit || 10;
                    const apiUrl = `https://api.ethfollow.xyz/api/v1/users/${encodeURIComponent(args.ensName)}/following?limit=${limit}`;
                    const response = await fetch(apiUrl, {
                      headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json() as { following: Array<{ address: string; ens?: { name: string } }> };
                    const followingNames = data.following.map(f => f.ens?.name || f.address);
                    
                    result = {
                      content: [{
                        type: "text",
                        text: `${args.ensName} is following:\n${followingNames.join('\n') || 'Not following anyone'}`
                      }]
                    };
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `API Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                case 'getRecommendations':
                  try {
                    const limit = args.limit || 10;
                    let apiUrl: string;
                    
                    if (args.ensName) {
                      // Get personalized recommendations
                      apiUrl = `https://api.ethfollow.xyz/api/v1/users/${encodeURIComponent(args.ensName)}/recommended?limit=${limit}`;
                    } else {
                      // Get general discover recommendations
                      apiUrl = `https://api.ethfollow.xyz/api/v1/discover?limit=${limit}`;
                    }
                    
                    const response = await fetch(apiUrl, {
                      headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json() as { 
                      recommended?: Array<{ address: string; ens?: { name: string }; followers_count?: number }>;
                      latestFollows?: Array<{ address: string; ens?: { name: string }; followers_count?: number }>;
                    };
                    
                    const profiles = data.recommended || data.latestFollows || [];
                    const profileList = profiles.map(p => 
                      `${p.ens?.name || p.address}${p.followers_count ? ` (${p.followers_count} followers)` : ''}`
                    );
                    
                    result = {
                      content: [{
                        type: "text",
                        text: args.ensName 
                          ? `Recommendations for ${args.ensName}:\n${profileList.join('\n') || 'No recommendations found'}`
                          : `Popular profiles to follow:\n${profileList.join('\n') || 'No recommendations found'}`
                      }]
                    };
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `API Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                case 'getLeaderboard':
                  try {
                    const limit = args.limit || 10;
                    let apiUrl = `https://api.ethfollow.xyz/api/v1/leaderboard/ranked?limit=${limit}`;
                    
                    if (args.search) {
                      apiUrl = `https://api.ethfollow.xyz/api/v1/leaderboard/search?limit=${limit}&term=${encodeURIComponent(args.search)}`;
                    }
                    
                    const response = await fetch(apiUrl, {
                      headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json() as { 
                      results: Array<{ 
                        address: string; 
                        ens?: { name: string }; 
                        followers_count: number;
                        rank?: number;
                      }> 
                    };
                    
                    const leaderboardList = data.results.map((user, index) => 
                      `${index + 1}. ${user.ens?.name || user.address} - ${user.followers_count} followers`
                    );
                    
                    result = {
                      content: [{
                        type: "text",
                        text: args.search 
                          ? `Leaderboard search for "${args.search}":\n${leaderboardList.join('\n') || 'No results found'}`
                          : `Top ${limit} users by followers:\n${leaderboardList.join('\n') || 'No results found'}`
                      }]
                    };
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `API Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                case 'searchENS':
                  try {
                    const query = `
                      query SearchQuery($search: String) {
                        domains(
                          where: {and: [{name_starts_with: $search}]}
                          orderBy: labelName
                          orderDirection: asc
                        ) {
                          name
                          resolvedAddress { id }
                        }
                      }
                    `;
                    
                    const response = await fetch('https://api.thegraph.com/subgraphs/name/ensdomains/ens', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        query,
                        variables: { search: args.query.trim() },
                        operationName: 'SearchQuery',
                      }),
                    });
                    
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json() as { 
                      data: { 
                        domains: Array<{ name: string; resolvedAddress: { id: string } | null }> 
                      } 
                    };
                    
                    const domains = data.data.domains
                      .filter(domain => domain.resolvedAddress)
                      .sort((a, b) => a.name.length - b.name.length)
                      .slice(0, 10);
                    
                    const domainList = domains.map(d => d.name);
                    
                    result = {
                      content: [{
                        type: "text",
                        text: `ENS names matching "${args.query}":\n${domainList.join('\n') || 'No ENS names found'}`
                      }]
                    };
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `API Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                case 'searchContexts':
                  try {
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

                    result = {
                      content: [{
                        type: "text",
                        text: results || "No contexts found matching your search"
                      }]
                    };
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                case 'searchFileContext':
                  try {
                    const results = await this.contextManager.searchFileContext(args.contextId, args.query);
                    
                    if (results.length === 0) {
                      result = {
                        content: [{
                          type: "text",
                          text: `No results found for "${args.query}" in context "${args.contextId}"`
                        }]
                      };
                    } else {
                      result = {
                        content: [{
                          type: "text",
                          text: `Search results for "${args.query}" in ${args.contextId}:\n\n${results.join('\n\n---\n\n')}`
                        }]
                      };
                    }
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                case 'getFileMetadata':
                  try {
                    const metadata = await this.contextManager.getFileMetadata(args.contextId);
                    
                    if (!metadata) {
                      result = {
                        content: [{
                          type: "text",
                          text: `File context "${args.contextId}" not found`
                        }]
                      };
                    } else {
                      result = {
                        content: [{
                          type: "text",
                          text: `Metadata for ${args.contextId}:
- Lines: ${metadata.lines.toLocaleString()}
- Characters: ${metadata.characters.toLocaleString()}
- Available sections: ${metadata.sections.join(', ') || 'None'}`
                        }]
                      };
                    }
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                case 'getFileSection':
                  try {
                    const sectionContent = await this.contextManager.getFileContextSection(args.contextId, args.section);
                    
                    if (!sectionContent) {
                      result = {
                        content: [{
                          type: "text",
                          text: `Section "${args.section}" not found in context "${args.contextId}"`
                        }]
                      };
                    } else {
                      result = {
                        content: [{
                          type: "text",
                          text: `Section "${args.section}" from ${args.contextId}:\n\n${sectionContent}`
                        }]
                      };
                    }
                  } catch (apiError) {
                    result = {
                      content: [{
                        type: "text",
                        text: `Error: ${apiError instanceof Error ? apiError.message : JSON.stringify(apiError)}`
                      }]
                    };
                  }
                  break;
                  
                default:
                  throw new Error(`Unknown tool: ${toolName}`);
              }
              
              response = {
                jsonrpc: "2.0",
                id: message.id,
                result
              };
            } catch (error) {
              response = {
                jsonrpc: "2.0",
                id: message.id,
                error: {
                  code: -32603,
                  message: error instanceof Error ? error.message : 'Internal error'
                }
              };
            }
            break;
            
          default:
            response = {
              jsonrpc: "2.0",
              id: message.id,
              error: {
                code: -32601,
                message: `Method not found: ${message.method}`
              }
            };
        }
        
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: error instanceof Error ? error.message : 'Parse error'
          }
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Default response for GET requests
    return new Response(JSON.stringify({
      name: "EthFollow MCP Server",
      version: "1.0.0",
      description: "MCP server for EthFollow API and documentation contexts",
      endpoints: {
        "GET /": "SSE endpoint for MCP (with Accept: text/event-stream)",
        "POST /": "MCP JSON-RPC endpoint"
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const mcp = new EthFollowMCP(env);
      await mcp.init();
      return mcp.fetch(request);
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Initialization failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  },
};