/**
 * AI Assistant Types
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  context?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export interface AssistantStatus {
  online: boolean;
  model: string;
  provider: string;
}

export interface Suggestion {
  id: string;
  text: string;
  category: 'order' | 'checklist' | 'workplan' | 'general';
}
