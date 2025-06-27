import type { ContextFile, ContextCategory } from '../types/context';

export class ContextManager {
  private contexts: Map<string, ContextFile> = new Map();
  private categories: Map<string, ContextCategory> = new Map();

  constructor(autoLoad: boolean = false) {
    // Simplified - no file loading needed
  }

  addContext(context: Omit<ContextFile, 'mimeType'> & { mimeType?: string }) {
    const fullContext: ContextFile = {
      ...context,
      mimeType: context.mimeType || 'text/markdown'
    };
    
    this.contexts.set(context.id, fullContext);
    
    // Add to category if specified
    if (context.category) {
      if (!this.categories.has(context.category)) {
        this.categories.set(context.category, {
          id: context.category,
          name: context.category.charAt(0).toUpperCase() + context.category.slice(1),
          description: `${context.category} related contexts`,
          contexts: []
        });
      }
      this.categories.get(context.category)!.contexts.push(fullContext);
    }
  }

  addBulkContexts(contexts: Array<Omit<ContextFile, 'mimeType'> & { mimeType?: string }>) {
    contexts.forEach(context => this.addContext(context));
  }

  getContext(id: string): ContextFile | undefined {
    return this.contexts.get(id);
  }

  getAllContexts(): ContextFile[] {
    return Array.from(this.contexts.values());
  }

  getAllContextIds(): string[] {
    return Array.from(this.contexts.keys());
  }

  getContextsByCategory(category: string): ContextFile[] {
    return this.categories.get(category)?.contexts || [];
  }

  getContextsByTags(tags: string[]): ContextFile[] {
    return this.getAllContexts().filter(context => 
      context.tags?.some(tag => tags.includes(tag))
    );
  }

  searchContexts(query: string): ContextFile[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllContexts().filter(context => 
      context.name.toLowerCase().includes(lowerQuery) ||
      context.description.toLowerCase().includes(lowerQuery) ||
      context.content.toLowerCase().includes(lowerQuery) ||
      context.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getCategories(): ContextCategory[] {
    return Array.from(this.categories.values());
  }

  // Export contexts for storage or transfer
  exportContexts(): {
    contexts: ContextFile[];
    categories: ContextCategory[];
  } {
    return {
      contexts: this.getAllContexts(),
      categories: this.getCategories()
    };
  }

  // Import contexts from external data
  importContexts(data: {
    contexts: ContextFile[];
    categories?: ContextCategory[];
  }): void {
    this.contexts.clear();
    this.categories.clear();
    
    this.addBulkContexts(data.contexts);
    
    if (data.categories) {
      data.categories.forEach(category => {
        this.categories.set(category.id, category);
      });
    }
  }
}