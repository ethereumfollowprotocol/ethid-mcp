import type { ContextFile } from '../types/context';
import { EFP_CONTENT } from '../content/efp-content';
import { EIK_CONTENT } from '../content/eik-content';
import { ENS_CONTENT } from '../content/ens-content';
import { SIWE_CONTENT } from '../content/siwe-content';

export interface FileContextConfig {
  id: string;
  name: string;
  description: string;
  filename: string;
  category?: string;
  tags?: string[];
  sections?: {
    [key: string]: {
      startMarker: string;
      endMarker?: string;
    };
  };
}

export class FileContextLoader {
  private cache: Map<string, string> = new Map();
  
  constructor() {}

  async loadFileContext(config: FileContextConfig): Promise<ContextFile> {
    const cacheKey = `${config.id}:full`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return {
        ...config,
        content: this.cache.get(cacheKey)!,
        mimeType: 'text/plain'
      };
    }

    try {
      // In Cloudflare Workers, we need to import the file content
      // For now, we'll return a placeholder that can be replaced with actual content
      let content = '';
      
      switch (config.filename) {
        case 'llms-efp.txt':
          content = await this.loadEfpContent();
          break;
        case 'llms-eik.txt':
          content = await this.loadEikContent();
          break;
        case 'llms-ens.txt':
          content = await this.loadEnsContent();
          break;
        case 'llms-siwe.txt':
          content = await this.loadSiweContent();
          break;
        default:
          content = `Content for ${config.filename} not found. Please ensure the file content is properly embedded.`;
      }
      
      // Cache the content
      this.cache.set(cacheKey, content);
      
      return {
        ...config,
        content,
        mimeType: 'text/plain'
      };
    } catch (error) {
      console.error(`Failed to load file context ${config.id}:`, error);
      return {
        ...config,
        content: `Error loading context file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        mimeType: 'text/plain'
      };
    }
  }

  private async loadEfpContent(): Promise<string> {
    return EFP_CONTENT;
  }

  private async loadEikContent(): Promise<string> {
    return EIK_CONTENT;
  }

  private async loadEnsContent(): Promise<string> {
    return ENS_CONTENT;
  }

  private async loadSiweContent(): Promise<string> {
    return SIWE_CONTENT;
  }

  async loadFileSection(config: FileContextConfig, sectionName: string): Promise<string> {
    const cacheKey = `${config.id}:${sectionName}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const fullContext = await this.loadFileContext(config);
    const content = fullContext.content;

    if (!config.sections || !config.sections[sectionName]) {
      return `Section "${sectionName}" not found in ${config.name}`;
    }

    const section = config.sections[sectionName];
    const startIndex = content.indexOf(section.startMarker);
    
    if (startIndex === -1) {
      return `Section marker "${section.startMarker}" not found in ${config.name}`;
    }

    let endIndex = content.length;
    if (section.endMarker) {
      const foundEndIndex = content.indexOf(section.endMarker, startIndex);
      if (foundEndIndex !== -1) {
        endIndex = foundEndIndex;
      }
    }

    const sectionContent = content.substring(startIndex, endIndex).trim();
    
    // Cache the section
    this.cache.set(cacheKey, sectionContent);
    
    return sectionContent;
  }

  async searchInFile(config: FileContextConfig, query: string): Promise<string[]> {
    const fullContext = await this.loadFileContext(config);
    const content = fullContext.content;
    const lines = content.split('\n');
    const results: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Find lines containing the query
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(lowerQuery)) {
        // Include some context (2 lines before and after)
        const start = Math.max(0, index - 2);
        const end = Math.min(lines.length - 1, index + 2);
        
        const contextLines = lines.slice(start, end + 1);
        results.push(`Lines ${start + 1}-${end + 1}:\n${contextLines.join('\n')}`);
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }

  async getFileMetadata(config: FileContextConfig): Promise<{
    lines: number;
    characters: number;
    sections: string[];
  }> {
    const fullContext = await this.loadFileContext(config);
    const content = fullContext.content;
    const lines = content.split('\n').length;
    const characters = content.length;
    const sections = config.sections ? Object.keys(config.sections) : [];

    return { lines, characters, sections };
  }

  clearCache() {
    this.cache.clear();
  }

  clearFileCache(configId: string) {
    // Clear all cache entries for this file
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${configId}:`)) {
        this.cache.delete(key);
      }
    }
  }
}