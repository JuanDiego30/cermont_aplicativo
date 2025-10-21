"use client";

import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Textarea } from '@mantine/core';
import { MessageCircle, X, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const sugerencias = [
  '¿Cómo registro una nueva orden con herramientas sugeridas?',
  'Explica cómo actualizar el estado de una orden a completada.',
  '¿Cómo consulto el historial y las evidencias de una orden?',
  '¿Qué necesito para facturar una orden completada?',
];

const AssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    setError(null);
  };

  const handleSuggestion = (prompt: string) => {
    if (!isOpen) {
      setIsOpen(true);
    }
    setTimeout(() => {
      void sendMessage(prompt);
    }, 80);
  };

  const sendMessage = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'No se pudo contactar al asistente.' }));
        throw new Error(payload.error || 'No se pudo contactar al asistente.');
      }

      const payload = (await response.json()) as { message?: { content?: string } };
      const assistantContent = payload?.message?.content?.trim();
      if (assistantContent) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: assistantContent,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      {isOpen && <div className="assistant-overlay" aria-hidden onClick={() => setIsOpen(false)} />}

      <div className={`assistant-panel ${isOpen ? 'assistant-panel--open' : ''}`} role="dialog" aria-label="Asistente virtual ATG">
        <header className="assistant-panel__header">
          <div>
            <p className="assistant-panel__title">Asistente ATG</p>
            <p className="assistant-panel__subtitle">Te ayudo con dudas sobre órdenes, fallas e informes.</p>
          </div>
          <button type="button" className="assistant-panel__close" onClick={toggleOpen} aria-label="Cerrar asistente">
            <X size={18} strokeWidth={2.5} />
          </button>
        </header>

        <div className="assistant-panel__suggestions">
          {sugerencias.map((text) => (
            <Badge key={text} variant="light" radius="xl" onClick={() => handleSuggestion(text)}>
              {text}
            </Badge>
          ))}
        </div>

        <div className="assistant-panel__viewport" ref={viewportRef}>
          {messages.length === 0 && !isLoading && !error && (
            <p className="assistant-panel__placeholder">¿En qué te puedo ayudar hoy?</p>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`assistant-bubble assistant-bubble--${message.role}`}>
              <span className="assistant-bubble__label">{message.role === 'user' ? 'Tú' : 'ATG'}</span>
              <p>{message.content}</p>
            </div>
          ))}

          {isLoading && (
            <div className="assistant-bubble assistant-bubble--assistant">
              <span className="assistant-bubble__label">ATG</span>
              <div className="assistant-bubble__typing">
                <Loader2 size={16} className="assistant-bubble__spinner" />
                <span>Pensando...</span>
              </div>
            </div>
          )}

          {error && <p className="assistant-panel__error">{error}</p>}
        </div>

        <form onSubmit={handleSubmit} className="assistant-panel__form">
          <Textarea
            placeholder="Escribe tu pregunta..."
            minRows={2}
            autosize
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            disabled={isLoading}
            required
          />
          <Button type="submit" disabled={isLoading || !input.trim()} loading={isLoading} fullWidth>
            Enviar
          </Button>
        </form>
      </div>

      <button
        type="button"
        className={`assistant-launcher ${isOpen ? 'assistant-launcher--active' : ''}`}
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls="assistant-widget"
        aria-label={isOpen ? 'Cerrar asistente virtual' : 'Abrir asistente virtual'}
      >
        <MessageCircle size={26} strokeWidth={2.4} />
      </button>
    </>
  );
};

export default AssistantWidget;
