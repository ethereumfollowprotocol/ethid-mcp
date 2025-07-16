import type { ContextFile } from '../types/context';

// Import all context modules
import { generalContexts } from './general';
import { technicalContexts } from './technical';
import { protocolContexts } from './protocols-content';

// Export all contexts
export const allContexts: ContextFile[] = [...generalContexts, ...technicalContexts, ...protocolContexts];

// Export individual context groups for selective loading
export { generalContexts, technicalContexts, protocolContexts };

// Helper function to get contexts by category
export function getContextsByCategory(category: string): ContextFile[] {
	return allContexts.filter((context) => context.category === category);
}

// Helper function to get contexts by tags
export function getContextsByTags(tags: string[]): ContextFile[] {
	return allContexts.filter((context) => context.tags?.some((tag) => tags.includes(tag)));
}
