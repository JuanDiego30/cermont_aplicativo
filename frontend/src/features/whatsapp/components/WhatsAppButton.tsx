import React from 'react';
import { Button } from '@/shared/components/ui';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink, generateMessage } from '../utils/whatsapp-generator';
import { WhatsAppTemplate } from '../types';

interface WhatsAppButtonProps {
    phoneNumber: string;
    template?: WhatsAppTemplate;
    data?: any;
    label?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
    phoneNumber,
    template = 'GENERAL_CONTACT',
    data = {},
    label = 'Contactar',
    variant = 'primary',
    size = 'md',
    className,
}) => {
    const handleClick = () => {
        if (!phoneNumber) {
            alert('No hay número de teléfono disponible.');
            return;
        }
        const message = generateMessage(template, data);
        const link = getWhatsAppLink(phoneNumber, message);
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={`gap-2 ${className}`}
            onClick={handleClick}
            title={`Enviar mensaje a ${phoneNumber}`}
        >
            <MessageCircle className="h-4 w-4" />
            {label}
        </Button>
    );
};
