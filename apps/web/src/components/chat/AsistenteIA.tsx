'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Loader2,
  Sparkles,
  HelpCircle,
  FileText,
  Calendar,
  Wrench
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'text' | 'suggestion' | 'action' | 'error';
    actions?: ChatAction[];
    data?: any;
  };
}

export interface ChatAction {
  label: string;
  action: string;
  params?: Record<string, any>;
  icon?: React.ReactNode;
}

interface AsistenteIAProps {
  onAction?: (action: string, params?: Record<string, any>) => void;
  contextData?: {
    currentPage?: string;
    ordenActiva?: string;
    usuario?: string;
  };
  className?: string;
}

// ============================================
// PREDEFINED RESPONSES (Simulación local)
// En producción, esto se conectaría a OpenAI/Claude API
// ============================================

const SUGERENCIAS_RAPIDAS = [
  { icon: <FileText className="w-4 h-4" />, text: '¿Cómo crear una orden?' },
  { icon: <Calendar className="w-4 h-4" />, text: 'Mostrar órdenes de hoy' },
  { icon: <Wrench className="w-4 h-4" />, text: 'Procedimiento de mantenimiento' },
  { icon: <HelpCircle className="w-4 h-4" />, text: 'Ayuda con formularios' },
];

const RESPUESTAS_PREDEFINIDAS: Record<string, string> = {
  'crear orden': `Para crear una nueva orden de trabajo:

1. Ve a **Dashboard > Órdenes > Nueva Orden**
2. Completa los datos del cliente y ubicación
3. Selecciona el tipo de trabajo (IT, MNT, SC, GEN)
4. Asigna técnicos disponibles
5. Define las fechas estimadas
6. Guarda la orden

¿Necesitas ayuda con algún paso específico?`,

  'ordenes hoy': `📋 **Resumen de órdenes para hoy:**

• **OT-2024-001** - Mantenimiento Torre T-15 (En ejecución)
• **OT-2024-002** - Inspección línea de vida (Pendiente)
• **OT-2024-003** - Instalación CCTV (Programada 14:00)

Para ver detalles, haz clic en cualquier orden o ve a **Dashboard > Órdenes**.`,

  'mantenimiento': `📖 **Procedimiento estándar de mantenimiento:**

**Antes de iniciar:**
1. Revisar orden de trabajo y alcance
2. Verificar permisos y documentación
3. Inspeccionar EPP y herramientas

**Durante la ejecución:**
1. Seguir checklist OPE-001
2. Documentar con fotos cada paso
3. Registrar materiales utilizados

**Al finalizar:**
1. Completar formulario de cierre
2. Subir evidencias fotográficas
3. Obtener firma del supervisor

¿Quieres ver un formulario específico?`,

  'formularios': `📝 **Formularios disponibles en el sistema:**

• **OPE-001** - Planeación de Obra
• **OPE-002** - Ejecución de Trabajo
• **OPE-003** - Cierre Administrativo
• **OPE-004** - Inspección de EPP
• **OPE-005** - Reporte de Incidentes
• **OPE-006** - Inspección Línea de Vida
• **OPE-007** - Control de Materiales

Para acceder, ve a **Dashboard > Formularios** o usa el botón "Nuevo" en cada módulo.`,

  'ayuda': `🤖 **¡Hola! Soy tu asistente CERMONT.**

Puedo ayudarte con:

✅ Crear y gestionar órdenes de trabajo
✅ Llenar formularios operativos
✅ Consultar procedimientos
✅ Ver estado de técnicos y equipos
✅ Generar reportes

**Comandos rápidos:**
• "Crear orden" - Iniciar nueva OT
• "Órdenes de hoy" - Ver agenda
• "Mantenimiento" - Procedimientos
• "Reportes" - Generar informes

¿En qué puedo ayudarte?`,

  default: `Entiendo tu consulta. Déjame ayudarte.

Para asistencia más específica, puedes:
1. Reformular tu pregunta
2. Usar los botones de sugerencias
3. Contactar soporte técnico

¿Hay algo más en lo que pueda ayudarte?`,
};

// ============================================
// COMPONENT
// ============================================

export function AsistenteIA({ onAction: _onAction, contextData: _contextData, className = '' }: AsistenteIAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy el asistente virtual de CERMONT. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll al nuevo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input cuando se abre
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Generar respuesta (simulada)
  const generateResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('crear') && lowerMessage.includes('orden')) {
      return RESPUESTAS_PREDEFINIDAS['crear orden'];
    }
    if (lowerMessage.includes('orden') && (lowerMessage.includes('hoy') || lowerMessage.includes('día'))) {
      return RESPUESTAS_PREDEFINIDAS['ordenes hoy'];
    }
    if (lowerMessage.includes('mantenimiento') || lowerMessage.includes('procedimiento')) {
      return RESPUESTAS_PREDEFINIDAS['mantenimiento'];
    }
    if (lowerMessage.includes('formulario') || lowerMessage.includes('formato')) {
      return RESPUESTAS_PREDEFINIDAS['formularios'];
    }
    if (lowerMessage.includes('ayuda') || lowerMessage.includes('hola') || lowerMessage.includes('qué puedes')) {
      return RESPUESTAS_PREDEFINIDAS['ayuda'];
    }

    return RESPUESTAS_PREDEFINIDAS['default'];
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Mensaje del usuario
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular delay de respuesta
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    // Respuesta del asistente
    const response = generateResponse(content);
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  }, [generateResponse]);

  // Manejar sugerencia rápida
  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // Manejar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Botón flotante
  // On mobile, position above bottom nav (bottom-24), on desktop use normal position (bottom-6)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group ${className}`}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </span>
        <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Asistente IA
        </span>
      </button>
    );
  }

  // Chat minimizado
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-72 border">
          <div className="flex items-center justify-between p-3 bg-linear-to-r from-blue-600 to-blue-700 rounded-t-xl">
            <div className="flex items-center gap-2 text-white">
              <Bot className="w-5 h-5" />
              <span className="font-medium text-sm">Asistente CERMONT</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat completo
  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 max-md:left-4 max-md:right-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full md:w-96 max-h-[calc(100vh-120px)] md:max-h-150 flex flex-col border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3 text-white">
            <div className="relative">
              <Bot className="w-8 h-8" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Asistente CERMONT</h3>
              <p className="text-xs text-blue-100">En línea • IA asistente</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <Minimize2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Sugerencias rápidas */}
        <div className="p-3 border-b bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-500 mb-2">Sugerencias rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {SUGERENCIAS_RAPIDAS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(sug.text)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-800 border rounded-full text-xs hover:bg-blue-50 hover:border-blue-300 transition"
              >
                {sug.icon}
                <span className="truncate max-w-30">{sug.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-linear-to-br from-purple-500 to-blue-500 text-white'
                }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              {/* Mensaje */}
              <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`rounded-2xl px-4 py-2.5 ${message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                  }`}>
                  <div
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              disabled={isTyping}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Powered by CERMONT IA • Respuestas simuladas
          </p>
        </div>
      </div>
    </div>
  );
}

export default AsistenteIA;
