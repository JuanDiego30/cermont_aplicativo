'use client';

/**
 * ARCHIVO: AssistantButton.tsx
 * FUNCION: Botón flotante de asistente con sugerencias basadas en RBAC
 * IMPLEMENTACION: FAB (Floating Action Button) con chat panel
 * DEPENDENCIAS: lucide-react, @/stores/authStore
 */

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Sugerencias contextuales por rol
const ROLE_SUGGESTIONS: Record<string, string[]> = {
    admin: [
        '¿Cómo crear un nuevo técnico?',
        '¿Cómo generar reportes del mes?',
        '¿Cuál es el estado de los proyectos activos?',
        '¿Cómo asignar órdenes a técnicos?',
        '¿Cómo ver las métricas del dashboard?',
    ],
    supervisor: [
        '¿Cómo revisar el progreso del equipo?',
        '¿Qué órdenes vencen hoy?',
        '¿Cómo aprobar una planeación?',
        '¿Cómo verificar evidencias de trabajo?',
    ],
    tecnico: [
        '¿Cuáles son mis órdenes pendientes?',
        '¿Cómo registrar evidencias fotográficas?',
        '¿Qué documentos necesito para esta orden?',
        '¿Cómo completar el checklist de seguridad?',
        '¿Cómo reportar un inconveniente?',
    ],
    administrativo: [
        '¿Cómo generar el cierre administrativo?',
        '¿Cuál es el estado de pagos pendientes?',
        '¿Cómo crear un informe de costos?',
        '¿Cómo revisar las facturas?',
    ],
};

// Respuestas predefinidas para el asistente (sin API externa por ahora)
const ASSISTANT_RESPONSES: Record<string, string> = {
    'crear un nuevo técnico': 'Para crear un nuevo técnico:\n1. Ve a **Técnicos** en el menú lateral\n2. Haz clic en **"Nuevo Técnico"**\n3. Completa el formulario con nombre, email, teléfono y especialidad\n4. Haz clic en **Guardar**',
    'generar reportes': 'Para generar reportes:\n1. Ve a **Reportes** en el menú\n2. Selecciona el tipo de reporte (Órdenes, Costos, Desempeño)\n3. Elige el rango de fechas\n4. Haz clic en **Generar PDF**',
    'órdenes pendientes': 'Tus órdenes pendientes aparecen en:\n1. **Dashboard** - Widget de "Mis Órdenes"\n2. **Órdenes** - Filtrar por "En Ejecución" o "Pendiente"\n\nRecuerda actualizar el estado cuando completes cada tarea.',
    'registrar evidencias': 'Para registrar evidencias:\n1. Abre la orden correspondiente\n2. Ve a la pestaña **"Evidencias"**\n3. Haz clic en **"Subir Foto"**\n4. Toma o selecciona la foto\n5. Añade una descripción\n6. Guarda los cambios',
    'checklist de seguridad': 'El checklist de seguridad (ATS) incluye:\n1. Verificación de EPP\n2. Análisis de riesgos\n3. Condiciones del área\n4. Permisos de trabajo\n\nComplétalo ANTES de iniciar cualquier trabajo.',
    'cierre administrativo': 'Para el cierre administrativo:\n1. Ve a **Cierre Administrativo**\n2. Revisa las órdenes completadas\n3. Verifica evidencias y firmas\n4. Genera el reporte final\n5. Envía para aprobación',
    default: 'Puedo ayudarte con:\n• Navegación del sistema\n• Gestión de órdenes\n• Registro de evidencias\n• Reportes y documentos\n\n¿En qué más puedo asistirte?',
};

function findResponse(query: string): string {
    const lowerQuery = query.toLowerCase();
    for (const [key, response] of Object.entries(ASSISTANT_RESPONSES)) {
        if (key !== 'default' && lowerQuery.includes(key)) {
            return response;
        }
    }
    return ASSISTANT_RESPONSES.default;
}

export function AssistantButton() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const userRole = user?.role || 'tecnico';
    const suggestions = ROLE_SUGGESTIONS[userRole] || ROLE_SUGGESTIONS.tecnico;

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content: messageText.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simular delay de respuesta
        await new Promise(resolve => setTimeout(resolve, 800));

        const response = findResponse(messageText);
        const assistantMessage: Message = {
            role: 'assistant',
            content: response,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(input);
        }
    };

    // Cerrar con Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <>
            {/* FAB Button - Fixed en móvil y desktop */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                    aria-label="Abrir asistente"
                >
                    <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </button>
            )}

            {/* Chat Panel - Responsive */}
            {isOpen && (
                <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-96 sm:h-[32rem] bg-white dark:bg-gray-900 sm:rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Asistente Cermont</h3>
                                <p className="text-xs text-blue-100">
                                    Hola {user?.name?.split(' ')[0] || 'usuario'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Cerrar asistente"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                        {messages.length === 0 ? (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    ¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?
                                </p>
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Sugerencias para ti ({userRole})
                                    </p>
                                    {suggestions.slice(0, 4).map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(suggestion)}
                                            className="w-full text-left text-sm bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-3 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-600'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-600">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Escribe tu pregunta..."
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                                disabled={isTyping}
                            />
                            <Button
                                onClick={() => handleSendMessage(input)}
                                disabled={isTyping || !input.trim()}
                                size="icon"
                                className="rounded-full w-10 h-10"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AssistantButton;
