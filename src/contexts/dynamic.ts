import type { ContextFile } from '../types/context';

// Function to create a dynamic context that fetches from Google Docs
export async function createDynamicContexts(env?: any): Promise<ContextFile[]> {
	const contexts: ContextFile[] = [];

	// Check if Google Doc ID is configured (Cloudflare Workers use env object)
	const GOOGLE_DOC_ID = env?.EFP_GOOGLE_DOC_ID || process?.env?.EFP_GOOGLE_DOC_ID;
	
	if (GOOGLE_DOC_ID) {
		try {
			// Fetch content from Google Doc (public/published doc)
			const response = await fetch(
				`https://docs.google.com/document/d/${GOOGLE_DOC_ID}/export?format=txt`,
				{
					headers: {
						'User-Agent': 'EFP-MCP/1.0'
					}
				}
			);

			if (response.ok) {
				const content = await response.text();
				
				contexts.push({
					id: 'efp-team-updates',
					name: 'EFP Team Updates',
					description: 'Latest ideas, updates, and knowledge from the EFP team',
					category: 'updates',
					content: content,
					mimeType: 'text/plain',
					tags: ['team', 'updates', 'ideas', 'roadmap', 'dynamic']
				});
			}
		} catch (error) {
			console.error('Failed to fetch Google Doc:', error);
			// Add a placeholder context if fetch fails
			contexts.push({
				id: 'efp-team-updates',
				name: 'EFP Team Updates',
				description: 'Latest ideas, updates, and knowledge from the EFP team',
				category: 'updates',
				content: `# EFP Team Updates

This context is configured to fetch content from a Google Doc but the fetch failed.

To enable this feature:
1. Create a Google Doc with your team updates
2. Make the document publicly viewable or publish it to the web
3. Set the EFP_GOOGLE_DOC_ID environment variable to your document ID
4. The document ID is the part between /d/ and /edit in the Google Docs URL

Example: For URL https://docs.google.com/document/d/ABC123XYZ/edit
The document ID is: ABC123XYZ`,
				mimeType: 'text/markdown',
				tags: ['team', 'updates', 'configuration']
			});
		}
	} else {
		// Add instructions if not configured
		contexts.push({
			id: 'efp-team-updates-setup',
			name: 'EFP Team Updates Setup',
			description: 'Instructions for setting up dynamic Google Docs integration',
			category: 'updates',
			content: `# Setting Up Dynamic Google Docs Integration

The EFP MCP can fetch content from a Google Doc to keep team knowledge updated.

## Setup Instructions

### 1. Create a Google Doc
Create a new Google Doc for your team updates, ideas, and knowledge base.

### 2. Make it Accessible
Either:
- Make the document viewable by anyone with the link
- Or publish it to the web (File > Share > Publish to web)

### 3. Get the Document ID
From your Google Doc URL:
\`https://docs.google.com/document/d/YOUR_DOCUMENT_ID/edit\`

### 4. Configure the Environment Variable
Add to your wrangler.toml or environment:
\`\`\`toml
[vars]
EFP_GOOGLE_DOC_ID = "YOUR_DOCUMENT_ID"
\`\`\`

### 5. Document Format Suggestions

Structure your Google Doc for easy parsing:

\`\`\`
# EFP Team Knowledge Base

## Current Ideas
- Idea 1: Description...
- Idea 2: Description...

## Roadmap
- Q1 2024: Goals...
- Q2 2024: Goals...

## Technical Decisions
- Decision 1: Rationale...
- Decision 2: Rationale...

## FAQ Updates
Q: Question?
A: Answer...
\`\`\`

## Benefits
- Keep AI assistants updated with latest team knowledge
- Share ideas and decisions across the team
- Maintain a living document of project evolution
- No need to redeploy MCP for content updates`,
			mimeType: 'text/markdown',
			tags: ['setup', 'google-docs', 'dynamic-content']
		});
	}

	return contexts;
}

// Export static contexts for backward compatibility
export const dynamicContexts: ContextFile[] = [
	{
		id: 'dynamic-content-info',
		name: 'Dynamic Content Information',
		description: 'Information about dynamic content features in EFP MCP',
		category: 'technical',
		content: `# Dynamic Content in EFP MCP

The EFP MCP supports dynamic content that can be updated without redeploying.

## Current Dynamic Sources

### Google Docs Integration
- Fetches content from a configured Google Doc
- Updates are reflected immediately when the doc is edited
- Useful for team knowledge, ideas, and roadmaps

## Future Dynamic Sources (Planned)
- GitHub Issues/Discussions
- Notion pages
- Team wikis
- RSS feeds

## Implementation
Dynamic contexts are fetched at runtime when searchContexts is called.
This ensures the AI always has access to the latest information.`,
		mimeType: 'text/markdown',
		tags: ['dynamic', 'features', 'technical']
	}
];