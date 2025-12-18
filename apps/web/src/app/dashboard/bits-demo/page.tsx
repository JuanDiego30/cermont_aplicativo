'use client';

import { Counter } from '@/components/ui/Counter';
import { ProfileCard } from '@/components/ui/ProfileCard';
import { PillNav } from '@/components/ui/PillNav';
import { ClickSpark } from '@/components/ui/ClickSpark';
import { Carousel } from '@/components/ui/Carousel';
import { MagnetButton } from '@/components/ui/MagnetButton';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { useState } from 'react';
import { Home, ListChecks, Users, Settings } from 'lucide-react';

export default function BitsDemo() {
    const [activeNav, setActiveNav] = useState('home');

    const navItems = [
        { id: 'home', label: 'Inicio', icon: <Home className="h-4 w-4" /> },
        { id: 'orders', label: 'Órdenes', icon: <ListChecks className="h-4 w-4" /> },
        { id: 'team', label: 'Equipo', icon: <Users className="h-4 w-4" /> },
        { id: 'settings', label: 'Config', icon: <Settings className="h-4 w-4" /> },
    ];

    const profileStats = [
        { label: 'Órdenes', value: 156 },
        { label: 'Completadas', value: '87%' },
        { label: 'Rating', value: 4.8 },
    ];

    return (
        <div className="space-y-12 pb-12">
            <div>
                <h1 className="text-3xl font-bold mb-2">React Bits Demo</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Demostración de componentes UI avanzados inspirados en React Bits.
                </p>
            </div>

            {/* Counter Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">1. Counter (Animated Numbers)</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SpotlightCard className="p-6 text-center">
                        <Counter value={1250} className="text-4xl font-bold text-brand-600" />
                        <p className="text-sm text-gray-500 mt-2">Órdenes Totales</p>
                    </SpotlightCard>
                    <SpotlightCard className="p-6 text-center">
                        <Counter value={98.5} decimals={1} suffix="%" className="text-4xl font-bold text-green-600" />
                        <p className="text-sm text-gray-500 mt-2">Satisfacción</p>
                    </SpotlightCard>
                    <SpotlightCard className="p-6 text-center">
                        <Counter value={45678} prefix="$" className="text-4xl font-bold text-purple-600" />
                        <p className="text-sm text-gray-500 mt-2">Ingresos</p>
                    </SpotlightCard>
                    <SpotlightCard className="p-6 text-center">
                        <Counter value={24} suffix=" hrs" className="text-4xl font-bold text-orange-600" />
                        <p className="text-sm text-gray-500 mt-2">Tiempo Promedio</p>
                    </SpotlightCard>
                </div>
            </section>

            {/* ProfileCard Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">2. ProfileCard</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <ProfileCard
                        name="Juan Pérez"
                        role="Técnico Senior"
                        stats={profileStats}
                    />
                    <ProfileCard
                        name="María García"
                        role="Coordinadora"
                        avatar="/avatars/user2.jpg"
                        stats={[
                            { label: 'Proyectos', value: 42 },
                            { label: 'Equipo', value: 8 },
                            { label: 'Años', value: 5 },
                        ]}
                    />
                </div>
            </section>

            {/* PillNav Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">3. PillNav (Segmented Control)</h2>
                <div className="flex flex-col items-start gap-4">
                    <PillNav
                        items={navItems}
                        defaultActiveId="home"
                        onChange={setActiveNav}
                    />
                    <p className="text-sm text-gray-500">
                        Selección actual: <span className="font-medium text-brand-600">{activeNav}</span>
                    </p>
                </div>
            </section>

            {/* ClickSpark Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">4. ClickSpark (Particle Effect)</h2>
                <div className="flex gap-4 flex-wrap">
                    <ClickSpark sparkColor="#8b5cf6" sparkCount={12}>
                        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                            Click Me! ✨
                        </button>
                    </ClickSpark>
                    <ClickSpark sparkColor="#f59e0b" sparkCount={8} sparkSize={8}>
                        <button className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors">
                            Sparks! 🎆
                        </button>
                    </ClickSpark>
                </div>
            </section>

            {/* MagnetButton Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">5. MagnetButton (Magnetic Effect)</h2>
                <div className="flex gap-4 flex-wrap">
                    <MagnetButton
                        className="px-6 py-3 bg-gradient-to-r from-brand-500 to-purple-600 text-white rounded-lg font-medium shadow-lg"
                        strength={40}
                    >
                        Hover Me 🧲
                    </MagnetButton>
                    <MagnetButton
                        className="px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-lg font-medium"
                        strength={60}
                    >
                        Strong Magnet
                    </MagnetButton>
                </div>
            </section>

            {/* Carousel Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">6. Carousel</h2>
                <Carousel className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800">
                    {[
                        { color: 'from-blue-500 to-purple-600', text: 'Slide 1' },
                        { color: 'from-green-500 to-teal-600', text: 'Slide 2' },
                        { color: 'from-orange-500 to-red-600', text: 'Slide 3' },
                    ].map((slide, i) => (
                        <div
                            key={i}
                            className={`flex h-64 items-center justify-center rounded-xl bg-gradient-to-r ${slide.color}`}
                        >
                            <span className="text-3xl font-bold text-white">{slide.text}</span>
                        </div>
                    ))}
                </Carousel>
            </section>

            {/* SpotlightCard Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold">7. SpotlightCard (Cursor Glow)</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {['Órdenes Activas', 'Técnicos Disponibles', 'Kits en Stock'].map((title) => (
                        <SpotlightCard key={title} className="p-6">
                            <h3 className="font-semibold mb-2">{title}</h3>
                            <p className="text-3xl font-bold text-brand-600">
                                <Counter value={Math.floor(Math.random() * 100) + 10} duration={1.5} />
                            </p>
                        </SpotlightCard>
                    ))}
                </div>
            </section>
        </div>
    );
}
