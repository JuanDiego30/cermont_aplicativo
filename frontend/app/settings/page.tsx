'use client';

import { PageHeader } from '@/components/patterns/PageHeader';
import { Settings, Construction, Bell, Lock, User, Globe } from 'lucide-react';
import { FeatureCard } from '@/components/patterns/FeatureCard';

const SETTINGS_SECTIONS = [
    {
        title: 'Perfil de Usuario',
        description: 'Gestiona tu información personal y preferencias de cuenta',
        icon: <User className="h-8 w-8" />,
    },
    {
        title: 'Seguridad',
        description: 'Configura tu contraseña y autenticación de dos factores',
        icon: <Lock className="h-8 w-8" />,
    },
    {
        title: 'Notificaciones',
        description: 'Personaliza las alertas y notificaciones que recibes',
        icon: <Bell className="h-8 w-8" />,
    },
    {
        title: 'Preferencias Generales',
        description: 'Ajusta el idioma, tema y otras configuraciones del sistema',
        icon: <Globe className="h-8 w-8" />,
    },
];

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                icon={Settings}
                title="Configuración"
                description="Administra tus preferencias y la configuración del sistema"
            />

            <div className="rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-12 text-center dark:border-neutral-700 dark:bg-neutral-900/50">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
                    <Construction className="h-12 w-12 text-neutral-500 dark:text-neutral-400" />
                </div>

                <h2 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                    Sección en Construcción
                </h2>

                <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                    Estamos trabajando en las opciones de configuración avanzada.
                    Pronto podrás gestionar todos los aspectos de tu cuenta desde aquí.
                </p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-left">
                    {SETTINGS_SECTIONS.map((section, i) => (
                        <div
                            key={section.title}
                            className="animate-slide-up"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <FeatureCard {...section} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
