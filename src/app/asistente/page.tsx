"use client";

import { useEffect, useRef, useState } from 'react';
import { Card, Container, Group, Stack, Text, Title, Badge, Button, Textarea, Alert } from '@mantine/core';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const sugerencias = [
  '¿Cómo registro una nueva orden con herramientas sugeridas?',
  'Explica cómo actualizar el estado de una orden a completada.',
  '¿Cómo consulto el historial y las evidencias de una orden?' ,
  'Recuérdame qué datos necesito para facturar una orden.'
];

export default function AsistentePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;
    setError(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(payload.error || 'Error en la respuesta del asistente');
      }

      const data = await response.json();
      if (data?.message?.content) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'No se pudo contactar al asistente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (prompt: string) => {
    if (isLoading) return;
    if (messages.length === 0) {
      void sendMessage(prompt);
      return;
    }
    setInput(prompt);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    void sendMessage(input);
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Title order={1}>Asistente Virtual ATG</Title>
        <Text c="dimmed">
          Pregunta lo que necesites sobre el flujo del aplicativo. ATG responde con base en las funciones actuales
          para ayudarte en planeación, ejecución, informes y costos.
        </Text>

        <Group gap="sm" wrap="wrap">
          {sugerencias.map((texto) => (
            <Badge
              key={texto}
              variant="light"
              radius="xl"
              fw={500}
              onClick={() => handleSuggestion(texto)}
              style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {texto}
            </Badge>
          ))}
        </Group>

        <Card withBorder padding="lg" radius="md" shadow="sm" style={{ minHeight: 320, maxHeight: 480, overflowY: 'auto' }}>
          <Stack gap="sm">
            {messages.length === 0 && (
              <Text c="dimmed">Inicia la conversación con una de las sugerencias o escribe tu pregunta.</Text>
            )}
            {messages.map((message) => (
              <Card
                key={message.id}
                padding="sm"
                radius="md"
                style={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: message.role === 'user' ? 'var(--mantine-color-blue-light)' : 'var(--mantine-color-gray-1)',
                }}
              >
                <Stack gap={4}>
                  <Text span fw={600} c={message.role === 'user' ? 'blue.7' : 'gray.7'}>
                    {message.role === 'user' ? 'Tú' : 'ATG'}
                  </Text>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{message.content}</Text>
                </Stack>
              </Card>
            ))}
            <div ref={bottomRef} />
          </Stack>
        </Card>

        {error && (
          <Alert color="red" variant="light" title="No pude responder" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <Textarea
              label="Tu pregunta"
              placeholder="Describe tu duda en detalle para que ATG pueda ayudarte"
              minRows={3}
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              disabled={isLoading}
              required
            />
            <Group justify="flex-end">
              <Button type="submit" loading={isLoading} disabled={!input.trim()}>
                {isLoading ? 'Pensando...' : 'Enviar'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
