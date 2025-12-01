import { WhatsAppTemplate } from '../types';

const BASE_URL = 'https://wa.me';

export const getWhatsAppLink = (phoneNumber: string, message: string): string => {
    // Clean phone number: remove non-digits, ensure it has country code if missing (defaulting to +57 for Colombia if length is 10)
    let cleanNumber = phoneNumber.replace(/\D/g, '');

    if (cleanNumber.length === 10) {
        cleanNumber = `57${cleanNumber}`;
    }

    const encodedMessage = encodeURIComponent(message);
    return `${BASE_URL}/${cleanNumber}?text=${encodedMessage}`;
};

export const generateMessage = (template: WhatsAppTemplate, data: any): string => {
    switch (template) {
        case 'ORDER_UPDATE':
            return `Hola ${data.clientName}, le informamos que su orden OT-${data.orderNumber} ha cambiado de estado a: ${data.state}.`;
        case 'PROPOSAL_READY':
            return `Hola ${data.clientName}, la propuesta comercial para la orden OT-${data.orderNumber} ya está lista para su revisión.`;
        case 'INVOICE_SENT':
            return `Hola ${data.clientName}, le hemos enviado la factura correspondiente a la orden OT-${data.orderNumber}. Agradecemos su gestión.`;
        case 'GENERAL_CONTACT':
        default:
            return `Hola, me comunico desde Cermont respecto a...`;
    }
};
