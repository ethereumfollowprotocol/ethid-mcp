export interface ContextFile {
  id: string;
  name: string;
  description: string;
  content: string;
  mimeType?: string;
  tags?: string[];
  category?: string;
}

export interface ContextCategory {
  id: string;
  name: string;
  description: string;
  contexts: ContextFile[];
}