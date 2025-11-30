'use client';

/**
 * Chat Container Component
 */

import { useRef, useEffect } from 'react';
import { Bot, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { useAssistantChat, useAssistantStatus } from '../hooks';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

const WELCOME_MESSAGE = `¡Hola! Soy el asistente virtual de CERMONT S.A.S. 🏗️

Puedo ayudarte con:
• Consultas sobre órdenes de trabajo y mantenimiento
• Información sobre planes de trabajo y checklists
• Guías para el uso del sistema
• Consultas sobre procedimientos en campo petrolero

¿En qué puedo ayudarte hoy?`;

export function ChatContainer() {
  const { messages, sendMessage, clearMessages, isLoading, error } = useAssistantChat();
  const { data: status, isLoading: statusLoading } = useAssistantStatus();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isOnline = status?.online ?? false;

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Asistente CERMONT
            </h2>
            <div className="flex items-center gap-2">
              {statusLoading ? (
                <span className="text-xs text-gray-500">Verificando...</span>
              ) : (
                <>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOnline ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isOnline ? 'En línea' : 'Desconectado'}
                  </span>
                  {status?.model && (
                    <span className="text-xs text-gray-400">• {status.model}</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            title="Limpiar conversación"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              ¡Bienvenido al Asistente CERMONT!
            </h3>
            <p className="max-w-md whitespace-pre-line text-sm text-gray-600 dark:text-gray-400">
              {WELCOME_MESSAGE}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 bg-white p-4 dark:bg-gray-900">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-t border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>Error al enviar mensaje. Por favor, intenta de nuevo.</span>
          </div>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        placeholder={isOnline ? 'Escribe tu mensaje...' : 'El asistente no está disponible'}
      />
    </div>
  );
}

export default ChatContainer;
