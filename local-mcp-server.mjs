#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  InitializeRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Configuration
const WORKER_URL = 'https://efp-mcp.efp.workers.dev';

// Create server instance
const server = new Server(
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

// Helper function to call worker methods
async function callWorkerMethod(methodName, args = {}) {
  try {
    const response = await fetch(`${WORKER_URL}/${methodName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error(`Worker request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Worker call failed:', error);
    throw new Error(`Failed to call worker method ${methodName}: ${error.message}`);
  }
}

// List all tools - with concise descriptions to prevent JSON splitting
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'getFollowerCount',
      description: 'Get follower/following counts',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'getFollowers',
      description: 'Get followers list',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          limit: { type: 'number', default: 10 },
          tags: { type: 'array', items: { type: 'string' } },
          search: { type: 'string' },
          sort: { type: 'string' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'getFollowing',
      description: 'Get following list',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          limit: { type: 'number', default: 10 },
          offset: { type: 'number' },
          tags: { type: 'array', items: { type: 'string' } },
          search: { type: 'string' },
          sort: { type: 'string' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'searchContexts',
      description: 'Search EFP docs',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          category: { type: 'string' }
        },
        required: ['query'],
      },
    },
    {
      name: 'checkFollowing',
      description: 'Check list follow',
      inputSchema: {
        type: 'object',
        properties: {
          list: { type: 'number' },
          following: { type: 'string' }
        },
        required: ['list', 'following'],
      },
    },
    {
      name: 'checkFollower',
      description: 'Check follow status',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          follower: { type: 'string' }
        },
        required: ['addressOrName', 'follower'],
      },
    },
    {
      name: 'fetchAccount',
      description: 'Get account info',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          list: { type: 'number' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'fetchProfileStats',
      description: 'Get profile stats',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          list: { type: 'number' },
          isLive: { type: 'boolean' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'fetchProfileLists',
      description: 'Get user lists',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          fresh: { type: 'boolean' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'fetchProfileBadges',
      description: 'Get POAP badges',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          list: { type: 'number' },
          fresh: { type: 'boolean' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'fetchProfileQRCode',
      description: 'Get profile QR',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'fetchProfileFollowing',
      description: 'Get following advanced',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          list: { type: 'number' },
          limit: { type: 'number' },
          pageParam: { type: 'number' },
          search: { type: 'string' },
          sort: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          allResults: { type: 'boolean' },
          fresh: { type: 'boolean' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'fetchProfileFollowers',
      description: 'Get followers advanced',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          list: { type: 'number' },
          limit: { type: 'number' },
          pageParam: { type: 'number' },
          search: { type: 'string' },
          sort: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          allResults: { type: 'boolean' },
          fresh: { type: 'boolean' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'fetchFollowingTags',
      description: 'Get following tags',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          list: { type: 'number' },
          fresh: { type: 'boolean' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'fetchFollowerTags',
      description: 'Get follower tags',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' },
          list: { type: 'number' },
          fresh: { type: 'boolean' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'fetchFollowState',
      description: 'Get follow state',
      inputSchema: {
        type: 'object',
        properties: {
          lookupAddressOrName: { type: 'string' },
          connectedAddress: { type: 'string' },
          list: { type: 'number' },
          type: { type: 'string' },
          fresh: { type: 'boolean' }
        },
        required: ['lookupAddressOrName'],
      },
    },
    {
      name: 'fetchNotifications',
      description: 'Get notifications',
      inputSchema: {
        type: 'object',
        properties: {
          userAddress: { type: 'string' },
          interval: { type: 'string' }
        },
        required: ['userAddress'],
      },
    },
    {
      name: 'fetchRecommendations',
      description: 'Get recommendations',
      inputSchema: {
        type: 'object',
        properties: {
          endpoint: { type: 'string' },
          addressOrName: { type: 'string' },
          list: { type: 'number' },
          limit: { type: 'number' },
          pageParam: { type: 'number' }
        },
        required: ['endpoint'],
      },
    },
    {
      name: 'fetchLeaderboard',
      description: 'Get leaderboard',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number' },
          search: { type: 'string' },
          filter: { type: 'string' },
          pageParam: { type: 'number' },
          direction: { type: 'string' }
        },
      },
    },
    {
      name: 'fetchPoapLink',
      description: 'Get POAP link',
      inputSchema: {
        type: 'object',
        properties: {
          userAddress: { type: 'string' }
        },
        required: ['userAddress'],
      },
    },
    {
      name: 'fetchListState',
      description: 'Export list state',
      inputSchema: {
        type: 'object',
        properties: {
          list: { type: 'number' }
        },
        required: ['list'],
      },
    },
    {
      name: 'fetchListsForUser',
      description: 'Get user lists',
      inputSchema: {
        type: 'object',
        properties: {
          addressOrName: { type: 'string' }
        },
        required: ['addressOrName'],
      },
    },
    {
      name: 'getBestPractices',
      description: 'Get best practices',
      inputSchema: {
        type: 'object',
        properties: {
          scenario: { type: 'string' }
        },
      },
    },
    {
      name: 'getUsagePattern',
      description: 'Get usage patterns',
      inputSchema: {
        type: 'object',
        properties: {
          queryType: { type: 'string' }
        },
      },
    },
    {
      name: 'getToolGuidance',
      description: 'Get tool guidance',
      inputSchema: {
        type: 'object',
        properties: {
          task: { type: 'string' }
        },
      },
    },
    {
      name: 'getEfficiencyTips',
      description: 'Get efficiency tips',
      inputSchema: {
        type: 'object',
        properties: {
          area: { type: 'string' }
        },
      },
    }
  ],
}));

// Handle initialize request - required for MCP protocol
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.error('Initialize request received');
  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: 'efp-mcp',
      version: '1.0.0',
    },
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    // Call the worker method and return the result
    const result = await callWorkerMethod(name, args);
    return result;
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error calling ${name}: ${error.message}`
        },
      ],
    };
  }
});

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('EFP MCP Local Server running - proxying to', WORKER_URL);
    console.error('Server capabilities:', JSON.stringify(server.getCapabilities()));
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Handle process events
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('Main function error:', error);
  process.exit(1);
});