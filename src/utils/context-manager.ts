import type { ContextFile, ContextCategory } from '../types/context';
import { FileContextLoader, type FileContextConfig } from './file-context-loader';

export class ContextManager {
  private contexts: Map<string, ContextFile> = new Map();
  private categories: Map<string, ContextCategory> = new Map();
  private fileContexts: Map<string, FileContextConfig> = new Map();
  private fileLoader: FileContextLoader;

  constructor(autoLoad: boolean = false) {
    this.fileLoader = new FileContextLoader();
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

  addFileContext(config: FileContextConfig) {
    this.fileContexts.set(config.id, config);
    
    // Add to category if specified
    if (config.category) {
      if (!this.categories.has(config.category)) {
        this.categories.set(config.category, {
          id: config.category,
          name: config.category.charAt(0).toUpperCase() + config.category.slice(1),
          description: `${config.category} related contexts`,
          contexts: []
        });
      }
    }
  }

  addBulkFileContexts(configs: FileContextConfig[]) {
    configs.forEach(config => this.addFileContext(config));
  }

  async getFileContext(id: string): Promise<ContextFile | undefined> {
    const config = this.fileContexts.get(id);
    if (!config) return undefined;
    
    return await this.fileLoader.loadFileContext(config);
  }

  async getFileContextSection(id: string, section: string): Promise<string | undefined> {
    const config = this.fileContexts.get(id);
    if (!config) return undefined;
    
    return await this.fileLoader.loadFileSection(config, section);
  }

  async searchFileContext(id: string, query: string): Promise<string[]> {
    const config = this.fileContexts.get(id);
    if (!config) return [];
    
    return await this.fileLoader.searchInFile(config, query);
  }

  async getFileMetadata(id: string) {
    const config = this.fileContexts.get(id);
    if (!config) return undefined;
    
    return await this.fileLoader.getFileMetadata(config);
  }

  getContext(id: string): ContextFile | undefined {
    return this.contexts.get(id);
  }

  getAllContexts(): ContextFile[] {
    return Array.from(this.contexts.values());
  }

  getAllFileContexts(): FileContextConfig[] {
    return Array.from(this.fileContexts.values());
  }

  getAllContextIds(): string[] {
    const regularIds = Array.from(this.contexts.keys());
    const fileIds = Array.from(this.fileContexts.keys());
    return [...regularIds, ...fileIds];
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

  // Load contexts from external source (e.g., files, API, database)
  async loadContextsFromSource(source: 'files' | 'api' | 'kv', config?: any): Promise<void> {
    switch (source) {
      case 'files':
        // In production, this could read from actual files
        // For now, contexts are loaded in constructor
        break;
      case 'api':
        // Could fetch contexts from an API
        break;
      case 'kv':
        // Could load from Cloudflare KV storage
        break;
    }
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

  // Import contexts from exported data
  importContexts(data: {
    contexts: ContextFile[];
    categories?: ContextCategory[];
  }) {
    data.contexts.forEach(context => this.addContext(context));
  }
}