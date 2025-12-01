import React from 'react';
import { Button } from '@/shared/components/ui';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsapp-generator';

interface WhatsAppFloatingActionProps {
    phoneNumber: string; // Support number
    message?: string;
}

export const WhatsAppFloatingAction: React.FC<WhatsAppFloatingActionProps> = ({
    phoneNumber,
    message = 'Hola, necesito soporte con la plataforma.',
}) => {
    const handleClick = () => {
        const link = getWhatsAppLink(phoneNumber, message);
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    return (
        <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#25D366] hover:bg-[#128C7E] text-white z-50"
            onClick={handleClick}
            title="Soporte WhatsApp"
        >
            <MessageCircle className="h-8 w-8" />
        </Button>
    );
};
