/**
 * AI Assistant API Service
 */

import { apiClient } from '@/core/api';
import type { ChatRequest, ChatResponse, AssistantStatus } from '../types';

const ENDPOINT = '/assistant';

export const assistantApi = {
  /**
   * Send a chat message to the AI assistant
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>(`${ENDPOINT}/chat`, request);
  },

  /**
   * Check if the AI assistant is online
   */
  async getStatus(): Promise<AssistantStatus> {
    return apiClient.get<AssistantStatus>(`${ENDPOINT}/status`);
  },

  /**
   * Get quick action suggestions
   */
  async getSuggestions(): Promise<{ suggestions: string[] }> {
    return apiClient.get<{ suggestions: string[] }>(`${ENDPOINT}/suggestions`);
  },
};

export default assistantApi;
