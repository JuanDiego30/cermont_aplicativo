import type { Request, Response } from 'express';
import { logger, getErrorMessage } from '../../../shared/utils/index.js';

/**
 * AI Assistant Controller
 * Uses Groq API for chat completions
 */
export class AIAssistantController {
  private readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly API_KEY: string;
  private readonly SYSTEM_PROMPT = `Eres un asistente virtual experto para CERMONT S.A.S., empresa colombiana de construcción y mantenimiento en el sector petrolero.

Tu función es ayudar a los técnicos y personal administrativo con:
- Procedimientos de trabajo seguro (AST)
- Listas de verificación de equipos y herramientas
- Normas de seguridad industrial
- Gestión de órdenes de trabajo
- Información sobre mantenimiento preventivo y correctivo

Contexto de operación:
- Campo petrolero: Caño Limón, Arauca (administrado por Sierracol Energy)
- Tipos de trabajo: instalación eléctrica, mantenimiento HVAC, construcción civil
- Sistema de gestión: CERMONT Sistema ATG

Responde de forma clara, profesional y práctica. Si no sabes algo específico de CERMONT, indícalo y sugiere contactar a un supervisor.`;

  constructor() {
    this.API_KEY = process.env.GROQ_API_KEY || '';
    if (!this.API_KEY) {
      logger.warn('⚠️ GROQ_API_KEY not set in environment');
    }
  }

  /**
   * Chat with AI assistant
   * POST /api/assistant/chat
   */
  chat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, history = [] } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Message is required',
        });
        return;
      }

      // Build conversation messages
      const messages = [
        { role: 'system', content: this.SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message },
      ];

      // Call Groq API
      const response = await fetch(this.GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // Fast and capable model
          messages,
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data: any = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

      res.json({
        success: true,
        data: {
          message: assistantMessage,
          model: data.model,
          usage: data.usage,
        },
      });
    } catch (error: unknown) {
      logger.error('AI Assistant error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get AI response',
        detail: getErrorMessage(error),
      });
    }
  };

  /**
   * Get assistant status (for health checks)
   * GET /api/assistant/status
   */
  getStatus = async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        available: !!this.API_KEY,
        model: 'llama-3.3-70b-versatile',
        provider: 'Groq',
      },
    });
  };
}

export const aiAssistantController = new AIAssistantController();
