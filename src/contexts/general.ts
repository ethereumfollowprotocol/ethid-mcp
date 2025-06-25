import type { ContextFile } from '../types/context';

export const generalContexts: ContextFile[] = [
  {
    id: 'readme',
    name: 'README',
    description: 'General context about the ethfollow project',
    category: 'general',
    content: `# EthFollow MCP Context

## Overview
This MCP (Model Context Protocol) server provides integration with ethfollow.xyz, allowing you to query follower relationships on the Ethereum Name Service (ENS).

## Available Tools

### getFollowerCount
Get the total number of followers for an ENS name.
- Parameter: \`ensName\` (e.g., "brantly.eth")
- Returns: Follower count

### checkFollowing
Check if one ENS name follows another.
- Parameters: 
  - \`follower\`: ENS name of the potential follower
  - \`following\`: ENS name of the account being checked
- Returns: Boolean result

### getFollowers
Get a list of followers for an ENS name.
- Parameters:
  - \`ensName\`: ENS name to query
  - \`limit\` (optional): Number of results to return (default: 10)
- Returns: List of follower ENS names

### getFollowing
Get a list of accounts an ENS name is following.
- Parameters:
  - \`ensName\`: ENS name to query
  - \`limit\` (optional): Number of results to return (default: 10)
- Returns: List of following ENS names

## Example Queries
- "How many followers does brantly.eth have?"
- "Does encrypteddegen.eth follow tahubucat.eth?"
- "Show me the first 20 followers of vitalik.eth"
- "Who is ens.eth following?"

## API Integration
This server integrates with the ethfollow.xyz API to provide real-time follower data for ENS names on Ethereum.`,
    mimeType: 'text/markdown',
    tags: ['overview', 'tools', 'examples']
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Quick start guide for using the EthFollow MCP',
    category: 'general',
    content: `# Getting Started with EthFollow MCP

## Prerequisites
- ENS names to query (e.g., "vitalik.eth", "ens.eth")
- Basic understanding of follower relationships

## Common Use Cases

### 1. Check Popularity
Ask: "How many followers does [name].eth have?"

### 2. Verify Relationships
Ask: "Does [follower].eth follow [following].eth?"

### 3. Discover Networks
Ask: "Show me who [name].eth is following"
Ask: "List the followers of [name].eth"

## Tips
- ENS names should include the .eth suffix
- Use limit parameter for large follower lists
- Results are real-time from the blockchain`,
    mimeType: 'text/markdown',
    tags: ['guide', 'quickstart', 'howto']
  }
];