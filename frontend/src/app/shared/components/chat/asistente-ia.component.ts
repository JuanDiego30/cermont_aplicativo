/**
 * Asistente IA Component - Migrado de Next.js
 * @see apps/web-old/src/components/chat/AsistenteIA.tsx
 *
 * Componente de chat con asistente inteligente para CERMONT
 * Incluye sugerencias rápidas, respuestas predefinidas y diseño moderno
 */

import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'text' | 'suggestion' | 'action' | 'error';
    data?: unknown;
  };
}

interface QuickSuggestion {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-asistente-ia',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './asistente-ia.component.html',
  styleUrl: './asistente-ia.component.css',
})
export class AsistenteIAComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  // Estado del componente
  isOpen = signal(false);
  isMinimized = signal(false);
  messages = signal<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy el asistente virtual de CERMONT. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  inputValue = signal('');
  isTyping = signal(false);

  // Sugerencias rápidas
  readonly quickSuggestions: QuickSuggestion[] = [
    { icon: '📄', text: '¿Cómo crear una orden?' },
    { icon: '📅', text: 'Mostrar órdenes de hoy' },
    { icon: '🔧', text: 'Procedimiento de mantenimiento' },
    { icon: '❓', text: 'Ayuda con formularios' },
  ];

  // Respuestas predefinidas
  private readonly predefinedResponses: Record<string, string> = {
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

    mantenimiento: `📖 **Procedimiento estándar de mantenimiento:**

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

    formularios: `📝 **Formularios disponibles en el sistema:**

• **OPE-001** - Planeación de Obra
• **OPE-002** - Ejecución de Trabajo
• **OPE-003** - Cierre Administrativo
• **OPE-004** - Inspección de EPP
• **OPE-005** - Reporte de Incidentes
• **OPE-006** - Inspección Línea de Vida
• **OPE-007** - Control de Materiales

Para acceder, ve a **Dashboard > Formularios** o usa el botón "Nuevo" en cada módulo.`,

    ayuda: `🤖 **¡Hola! Soy tu asistente CERMONT.**

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

  ngOnInit(): void {
    // Auto-scroll al nuevo mensaje
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  /**
   * Generar respuesta basada en el mensaje del usuario
   */
  private generateResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('crear') && lowerMessage.includes('orden')) {
      return this.predefinedResponses['crear orden'];
    }
    if (
      lowerMessage.includes('orden') &&
      (lowerMessage.includes('hoy') || lowerMessage.includes('día'))
    ) {
      return this.predefinedResponses['ordenes hoy'];
    }
    if (lowerMessage.includes('mantenimiento') || lowerMessage.includes('procedimiento')) {
      return this.predefinedResponses['mantenimiento'];
    }
    if (lowerMessage.includes('formulario') || lowerMessage.includes('formato')) {
      return this.predefinedResponses['formularios'];
    }
    if (
      lowerMessage.includes('ayuda') ||
      lowerMessage.includes('hola') ||
      lowerMessage.includes('qué puedes')
    ) {
      return this.predefinedResponses['ayuda'];
    }

    return this.predefinedResponses['default'];
  }

  /**
   * Enviar mensaje
   */
  async sendMessage(content?: string): Promise<void> {
    const messageContent = content || this.inputValue().trim();
    if (!messageContent) return;

    // Mensaje del usuario
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    this.inputValue.set('');
    this.isTyping.set(true);

    // Simular delay de respuesta
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    // Respuesta del asistente
    const response = this.generateResponse(messageContent);
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    this.messages.update(msgs => [...msgs, assistantMessage]);
    this.isTyping.set(false);
    this.scrollToBottom();
  }

  /**
   * Manejar sugerencia rápida
   */
  handleSuggestion(suggestion: string): void {
    this.sendMessage(suggestion);
  }

  /**
   * Manejar tecla Enter
   */
  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Abrir chat
   */
  openChat(): void {
    this.isOpen.set(true);
    this.isMinimized.set(false);
  }

  /**
   * Cerrar chat
   */
  closeChat(): void {
    this.isOpen.set(false);
  }

  /**
   * Minimizar chat
   */
  minimizeChat(): void {
    this.isMinimized.set(true);
  }

  /**
   * Maximizar chat
   */
  maximizeChat(): void {
    this.isMinimized.set(false);
  }

  /**
   * Scroll al final de los mensajes
   */
  private scrollToBottom(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }

  /**
   * Formatear contenido del mensaje (markdown básico)
   */
  formatMessage(content: string): string {
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  }

  /**
   * Formatear hora
   */
  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
