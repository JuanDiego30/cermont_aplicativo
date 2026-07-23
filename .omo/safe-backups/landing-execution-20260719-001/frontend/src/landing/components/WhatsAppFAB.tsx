"use client";

import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "573165352952";
const WHATSAPP_MESSAGE = encodeURIComponent(
	"Hola, estoy interesado en los servicios de Cermont S.A.S.",
);

export function WhatsAppFAB() {
	return (
		<a
			href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
			target="_blank"
			rel="noopener noreferrer"
			className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#20bd5a] active:scale-95"
			aria-label="Contactar por WhatsApp"
		>
			<MessageCircle className="size-7" aria-hidden="true" />
		</a>
	);
}
