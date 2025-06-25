# Adding New Contexts to EthFollow MCP

This guide explains how to add new context files to the EthFollow MCP server.

## Quick Start

### Method 1: Add to Context Modules (Recommended)

1. Choose the appropriate category for your context:
   - `src/contexts/general.ts` - General information and guides
   - `src/contexts/technical.ts` - Technical documentation and API info
   - `src/contexts/business.ts` - Business rules and domain knowledge

2. Add your context to the appropriate file:

```typescript
// Example: Adding to src/contexts/general.ts
export const generalContexts: ContextFile[] = [
  // ... existing contexts
  {
    id: 'my-new-context',
    name: 'My New Context',
    description: 'Description of what this context provides',
    category: 'general',
    content: `# My Context Title
    
Your markdown content here...`,
    mimeType: 'text/markdown',
    tags: ['tag1', 'tag2']
  }
];
```

### Method 2: Create a New Category

1. Create a new file in `src/contexts/`:
```typescript
// src/contexts/mycategory.ts
import type { ContextFile } from '../types/context';

export const myCategoryContexts: ContextFile[] = [
  {
    id: 'my-context',
    name: 'My Context',
    description: 'Context description',
    category: 'mycategory',
    content: `Your content here...`,
    mimeType: 'text/markdown',
    tags: ['custom', 'tags']
  }
];
```

2. Update `src/contexts/index.ts`:
```typescript
import { myCategoryContexts } from './mycategory';

export const allContexts: ContextFile[] = [
  ...generalContexts,
  ...technicalContexts,
  ...businessContexts,
  ...myCategoryContexts, // Add your category
];

export { generalContexts, technicalContexts, businessContexts, myCategoryContexts };
```

## Context File Structure

Each context must have:
- `id`: Unique identifier (lowercase, no spaces)
- `name`: Display name
- `description`: Brief description
- `content`: The actual content (usually Markdown)

Optional fields:
- `category`: Category grouping
- `tags`: Array of searchable tags
- `mimeType`: Content type (default: 'text/markdown')

## Best Practices

### 1. Choose Meaningful IDs
```typescript
// Good
id: 'api-authentication-guide'

// Bad
id: 'guide1'
```

### 2. Use Descriptive Names and Descriptions
```typescript
// Good
name: 'API Authentication Guide',
description: 'How to authenticate with the EthFollow API'

// Bad
name: 'Auth',
description: 'Authentication'
```

### 3. Tag Appropriately
```typescript
tags: ['api', 'authentication', 'security', 'technical']
```

### 4. Format Content Well
- Use Markdown for readability
- Include examples where relevant
- Structure with clear headings
- Keep content focused

## Advanced: Dynamic Context Loading

### From Cloudflare KV

1. Store contexts in KV:
```typescript
await env.CONTEXT_KV.put('context:my-context', JSON.stringify({
  id: 'my-context',
  name: 'My Context',
  description: 'Dynamic context',
  content: 'Content from KV',
  category: 'dynamic',
  tags: ['kv', 'dynamic']
}));
```

2. Configure KV binding in `wrangler.jsonc`:
```json
{
  "kv_namespaces": [
    { "binding": "CONTEXT_KV", "id": "your-kv-id" }
  ]
}
```

### From External API

Use the ContextLoader to fetch from an API:
```typescript
// In your init() method
await ContextLoader.loadFromAPI(
  this.contextManager,
  'https://api.example.com'
);
```

## Testing Your Contexts

1. Run locally:
```bash
npm run dev
```

2. Test context listing:
- The MCP will list all contexts as resources
- Check that your context appears

3. Test context reading:
- Request your context by ID
- Verify content is returned correctly

4. Test search:
- Use the searchContexts tool
- Verify your context is found by tags/content

## Examples

### Example 1: FAQ Context
```typescript
{
  id: 'faq',
  name: 'Frequently Asked Questions',
  description: 'Common questions about EthFollow',
  category: 'general',
  content: `# FAQ

## What is an ENS name?
An ENS name is a human-readable address...

## How do I get followers?
Other users can follow your ENS name...`,
  tags: ['faq', 'help', 'questions']
}
```

### Example 2: Integration Guide
```typescript
{
  id: 'integration-guide',
  name: 'Integration Guide',
  description: 'How to integrate EthFollow into your app',
  category: 'technical',
  content: `# Integration Guide

## Installation
\`\`\`bash
npm install ethfollow-sdk
\`\`\`

## Basic Usage
\`\`\`javascript
const ethfollow = new EthFollow();
\`\`\``,
  tags: ['integration', 'sdk', 'development']
}
```

## Large File Contexts

For very large context files (like documentation files), you can use the file-based context system:

### Adding Large File Contexts

1. Place your text files in `src/contexts/files/`
2. Create a configuration in `src/contexts/protocols.ts`:

```typescript
{
  id: 'my-large-context',
  name: 'My Large Documentation',
  description: 'Complete documentation for my protocol',
  filename: 'my-docs.txt',
  category: 'protocols',
  tags: ['documentation', 'reference'],
  sections: {
    'introduction': {
      startMarker: '# Introduction',
      endMarker: '# Getting Started'
    },
    'api': {
      startMarker: '# API Reference',
      endMarker: '# Examples'
    }
  }
}
```

### Available Tools for Large Contexts

- **searchFileContext**: Search within a specific large file
- **getFileMetadata**: Get information about file size and sections
- **getFileSection**: Get a specific section from a large file

### Example Usage

```typescript
// Search within the EFP documentation
await mcp.searchFileContext('efp-full', 'NFT roles');

// Get metadata about a file
await mcp.getFileMetadata('ens-full');

// Get a specific section
await mcp.getFileSection('efp-full', 'nft');
```

### Section Configuration

Define sections in your context config to enable section-based access:

```typescript
sections: {
  'section-name': {
    startMarker: 'text that marks the start',
    endMarker: 'text that marks the end' // optional
  }
}
```

If no `endMarker` is provided, the section extends to the end of the file.

## Current File Contexts

The following large file contexts are available:

- **efp-full**: Complete EFP documentation (~9K lines)
- **eik-full**: Ethereum Identity Kit documentation (~40K lines)
- **ens-full**: Complete ENS documentation (~22K lines)
- **siwe-full**: Sign-In with Ethereum documentation (~3K lines)

Each has predefined sections for easier navigation.

## Troubleshooting

### Context Not Appearing
1. Check the context ID is unique
2. Verify the file is imported in `src/contexts/index.ts`
3. For file contexts, check the configuration in `src/contexts/protocols.ts`
4. Rebuild and restart the server

### Search Not Finding Context
1. Check tags are properly set
2. Verify search terms match content/tags/description
3. Check category filters
4. For file contexts, use `searchFileContext` instead of `searchContexts`

### Content Not Loading
1. Verify the content field is populated
2. Check for syntax errors in content
3. Ensure proper escaping of special characters
4. For file contexts, verify the file exists in `src/contexts/files/`

### File Context Issues
1. Check file path is correct in configuration
2. Verify file exists and is readable
3. Check section markers are present in the file
4. Review console for file loading errors