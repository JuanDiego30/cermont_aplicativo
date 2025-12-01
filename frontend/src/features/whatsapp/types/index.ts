export interface WhatsAppMessage {
    phoneNumber: string;
    message?: string;
    context?: {
        orderNumber?: string;
        clientName?: string;
        type?: 'UPDATE' | 'PROPOSAL' | 'INVOICE' | 'GENERAL';
    };
}

export type WhatsAppTemplate = 'ORDER_UPDATE' | 'PROPOSAL_READY' | 'INVOICE_SENT' | 'GENERAL_CONTACT';
