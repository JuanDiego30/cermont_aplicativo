import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `Eres ATG, asistente virtual de Cermont. Ayudas a técnicos, coordinadores y clientes a usar el aplicativo de gestión de órdenes.

Responde siempre en español claro y conciso.
- Explica los pasos dentro del sistema antes de sugerir acciones externas.
- Cuando tengas dudas o falte información, pregunta antes de asumir.
- Relaciona tus respuestas con módulos existentes: órdenes, fallas, herramientas sugeridas, historial, informes y costos.
- Si la solicitud implica algo que aún no existe, propone cómo lograrlo con las funciones actuales o sugiere el siguiente paso de implementación.`;

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Falta configurar GROQ_API_KEY (o OPENAI_API_KEY) en las variables de entorno.' }),
        {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? (body.messages as ChatMessage[]) : [];
    const context = typeof body?.context === 'string' ? body.context : undefined;

    const conversation: ChatMessage[] = [
      {
        role: 'system',
        content: context ? `${SYSTEM_PROMPT}\n\nContexto adicional:\n${context}` : SYSTEM_PROMPT,
      },
      ...messages
        .filter((message): message is ChatMessage => typeof message?.role === 'string' && typeof message?.content === 'string')
        .map((message): ChatMessage => ({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content,
        })),
    ];

    const payload = {
      model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages: conversation.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      temperature: 0.2,
      max_tokens: 800,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message = errorPayload?.error?.message || 'OpenAI devolvió un error inesperado.';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const completion = (await response.json()) as {
      choices?: Array<{
        message?: { content?: string };
      }>;
    };

    const outputText = completion.choices?.[0]?.message?.content ?? '';

    return new Response(
      JSON.stringify({
        message: {
          role: 'assistant',
          content: outputText.trim() || 'No pude generar una respuesta en este momento.',
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('POST /api/assistant error', error);
    return new Response(JSON.stringify({ error: 'No se pudo generar la respuesta del asistente.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
