/**
 * AI Assistant Hooks
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { assistantApi } from '../api';
import type { Message, ChatRequest } from '../types';

/**
 * Hook for chat functionality with the AI assistant
 */
export function useAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);

  const chatMutation = useMutation({
    mutationFn: (request: ChatRequest) => assistantApi.chat(request),
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Build conversation history
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Send to API
      await chatMutation.mutateAsync({
        message: content,
        conversationHistory,
      });
    },
    [messages, chatMutation]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading: chatMutation.isPending,
    error: chatMutation.error,
  };
}

/**
 * Hook for checking assistant status
 */
export function useAssistantStatus() {
  return useQuery({
    queryKey: ['assistant', 'status'],
    queryFn: () => assistantApi.getStatus(),
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
}

/**
 * Hook for getting quick suggestions
 */
export function useAssistantSuggestions() {
  return useQuery({
    queryKey: ['assistant', 'suggestions'],
    queryFn: () => assistantApi.getSuggestions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
