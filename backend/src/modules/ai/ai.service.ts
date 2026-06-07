/**
 * AI Service — Business Logic Layer
 *
 * Provides mock or simple rule-based AI processing for the Cermont AI Assistant.
 */

import { Order } from "../../models";

export interface AIEnvelope {
	message: string;
	suggestedActions?: string[];
}

export async function processUserQuery(query: string): Promise<AIEnvelope> {
	const normalizedQuery = query.toLowerCase();

	// Basic Rule-Based logic for Cermont AI

	if (normalizedQuery.includes("estado") || normalizedQuery.includes("orden")) {
		const activeOrders = await Order.countDocuments({
			status: { $in: ["open", "assigned", "in_progress"] },
		});
		return {
			message: `Actualmente hay ${activeOrders} órdenes activas en el sistema. ¿Te gustaría ver un listado de las prioridades altas?`,
			suggestedActions: ["Ver órdenes críticas", "Crear orden de trabajo"],
		};
	}

	if (normalizedQuery.includes("reporte") || normalizedQuery.includes("informe")) {
		return {
			message:
				"Puedo ayudarte a generar un informe de ejecución o cierre. Selecciona una orden de trabajo primero.",
			suggestedActions: ["Ir a módulos de órdenes", "Ver dashboard"],
		};
	}

	if (normalizedQuery.includes("ayuda") || normalizedQuery.includes("ayudar")) {
		return {
			message:
				"Soy Cermont AI, tu asistente operativo. Puedo ayudarte con:\\n• Estado de órdenes de trabajo\\n• Generación de reportes técnicos\\n• Búsqueda de recursos y mantenimientos\\n\\n¿Por dónde empezamos?",
		};
	}

	return {
		message:
			"He recibido tu consulta, pero como asistente en fase beta aún estoy aprendiendo sobre este dominio específico. Te sugiero usar las opciones del menú lateral por el momento.",
	};
}
