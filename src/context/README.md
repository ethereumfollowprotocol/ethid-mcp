# EthFollow MCP Context

## Overview
This MCP (Model Context Protocol) server provides integration with ethfollow.xyz, allowing you to query follower relationships on the Ethereum Name Service (ENS).

## Available Tools

### getFollowerCount
Get the total number of followers for an ENS name.
- Parameter: `ensName` (e.g., "brantly.eth")
- Returns: Follower count

### checkFollowing
Check if one ENS name follows another.
- Parameters: 
  - `follower`: ENS name of the potential follower
  - `following`: ENS name of the account being checked
- Returns: Boolean result

### getFollowers
Get a list of followers for an ENS name.
- Parameters:
  - `ensName`: ENS name to query
  - `limit` (optional): Number of results to return (default: 10)
- Returns: List of follower ENS names

### getFollowing
Get a list of accounts an ENS name is following.
- Parameters:
  - `ensName`: ENS name to query
  - `limit` (optional): Number of results to return (default: 10)
- Returns: List of following ENS names

## Example Queries
- "How many followers does brantly.eth have?"
- "Does encrypteddegen.eth follow tahubucat.eth?"
- "Show me the first 20 followers of vitalik.eth"
- "Who is ens.eth following?"

## API Integration
This server integrates with the ethfollow.xyz API to provide real-time follower data for ENS names on Ethereum.