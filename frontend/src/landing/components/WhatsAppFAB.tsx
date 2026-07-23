import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "../landing-constants";

export function WhatsAppFAB() {
	return (
		<a
			href={WHATSAPP_URL}
			target="_blank"
			rel="noopener noreferrer"
			data-analytics="cta-whatsapp"
			data-analytics-label="whatsapp-fab"
			className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-110 hover:bg-whatsapp-dark active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-whatsapp motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
			aria-label="Contactar por WhatsApp, abre en nueva pestaña"
		>
			<MessageCircle className="size-7" aria-hidden="true" />
		</a>
	);
}
