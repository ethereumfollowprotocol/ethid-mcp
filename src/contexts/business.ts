import type { ContextFile } from '../types/context';

export const businessContexts: ContextFile[] = [
  {
    id: 'business-context',
    name: 'Business Context',
    description: 'Business rules and domain knowledge',
    category: 'business',
    content: `# EthFollow Business Context

## What is EthFollow?
EthFollow is a social graph protocol built on Ethereum that allows ENS name holders to follow each other, creating a decentralized social network.

## Key Concepts
- **ENS Names**: Ethereum Name Service names (e.g., vitalik.eth) serve as user identities
- **Following**: One-directional relationship where one ENS name follows another
- **Followers**: ENS names that follow a particular account
- **Social Graph**: The network of following relationships

## Business Rules
1. Only valid ENS names can participate in the social graph
2. Following relationships are public and queryable
3. Users can follow/unfollow at any time
4. No approval needed to follow someone

## Use Cases
- Social discovery in Web3
- Reputation systems
- Content curation
- Community building`,
    mimeType: 'text/markdown',
    tags: ['business', 'domain', 'rules']
  },
  {
    id: 'use-cases',
    name: 'Use Cases & Examples',
    description: 'Real-world use cases for EthFollow',
    category: 'business',
    content: `# EthFollow Use Cases & Examples

## Social Discovery
Find interesting people in Web3 by exploring who prominent figures follow.

### Example Queries:
- "Who does vitalik.eth follow?"
- "Show me accounts that follow both ens.eth and brantly.eth"

## Reputation & Trust
Use follower count as a signal for reputation and trust.

### Example Queries:
- "How many followers does this NFT artist have?"
- "Compare follower counts between these addresses"

## Community Analysis
Understand community structures and connections.

### Example Queries:
- "List the top followers of ethereum.eth"
- "Find mutual connections between addresses"

## Content Curation
Discover content based on who you follow.

### Example Use:
- Filter content by accounts you follow
- Prioritize posts from highly-followed accounts

## Governance & DAOs
Use social graphs for governance participation.

### Example Use:
- Weight votes by follower count
- Identify influential community members`,
    mimeType: 'text/markdown',
    tags: ['usecases', 'examples', 'business']
  },
  {
    id: 'glossary',
    name: 'Glossary',
    description: 'Key terms and definitions',
    category: 'business',
    content: `# EthFollow Glossary

## Terms & Definitions

### ENS (Ethereum Name Service)
A decentralized naming system on Ethereum that maps human-readable names like "alice.eth" to Ethereum addresses.

### Social Graph
The network structure formed by following relationships between ENS names.

### Follower
An ENS name that has chosen to follow another ENS name.

### Following
The list of ENS names that a particular account follows.

### Mutual Follow
When two ENS names follow each other.

### Web3 Social
Social networking concepts applied to blockchain-based identities.

### On-chain
Data stored directly on the Ethereum blockchain.

### Decentralized Identity
Identity systems not controlled by a single entity.

## Common Patterns

### Influencers
ENS names with high follower counts.

### Connectors
ENS names that follow and are followed by many others.

### Communities
Clusters of ENS names with high mutual following.`,
    mimeType: 'text/markdown',
    tags: ['glossary', 'terminology', 'definitions']
  }
];