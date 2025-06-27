import { ContextManager } from './context-manager';
import { allContexts } from '../contexts';
import type { ContextFile } from '../types/context';

export class ContextLoader {
  static loadFromModules(manager: ContextManager): void {
    // Load all contexts from the contexts directory (now includes protocols!)
    manager.addBulkContexts(allContexts);
  }

  static async loadFromKV(manager: ContextManager, kv: any): Promise<void> {
    // Example implementation for loading from Cloudflare KV
    try {
      const contextKeys = await kv.list({ prefix: 'context:' });
      
      for (const key of contextKeys.keys) {
        const context = await kv.get(key.name, 'json') as ContextFile;
        if (context) {
          manager.addContext(context);
        }
      }
    } catch (error) {
      console.error('Failed to load contexts from KV:', error);
    }
  }

  static async loadFromAPI(manager: ContextManager, apiUrl: string): Promise<void> {
    // Example implementation for loading from an API
    try {
      const response = await fetch(`${apiUrl}/contexts`);
      if (response.ok) {
        const contexts = await response.json() as ContextFile[];
        manager.addBulkContexts(contexts);
      }
    } catch (error) {
      console.error('Failed to load contexts from API:', error);
    }
  }

  static async loadFromJSON(manager: ContextManager, jsonData: string): Promise<void> {
    // Load contexts from JSON string
    try {
      const data = JSON.parse(jsonData) as {
        contexts: ContextFile[];
      };
      manager.addBulkContexts(data.contexts);
    } catch (error) {
      console.error('Failed to load contexts from JSON:', error);
    }
  }

  // Helper to create a context file structure
  static createContext(
    id: string,
    name: string,
    description: string,
    content: string,
    options?: {
      category?: string;
      tags?: string[];
      mimeType?: string;
    }
  ): ContextFile {
    return {
      id,
      name,
      description,
      content,
      category: options?.category,
      tags: options?.tags,
      mimeType: options?.mimeType || 'text/markdown'
    };
  }
}