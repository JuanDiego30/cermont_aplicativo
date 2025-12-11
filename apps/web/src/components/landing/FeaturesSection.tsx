import {
    Wrench,
    Zap,
    Snowflake,
    Building2,
    Package,
    Users
} from 'lucide-react';

const services = [
    {
        icon: Building2,
        title: 'Construcción',
        description: 'Montajes de obras civiles con los más altos estándares de calidad y seguridad industrial.',
        color: 'blue',
    },
    {
        icon: Zap,
        title: 'Electricidad',
        description: 'Instalaciones y mantenimiento de sistemas eléctricos industriales y comerciales.',
        color: 'yellow',
    },
    {
        icon: Snowflake,
        title: 'Refrigeración',
        description: 'Sistemas de refrigeración industrial con tecnología de última generación.',
        color: 'cyan',
    },
    {
        icon: Wrench,
        title: 'Montajes',
        description: 'Montajes industriales y telecomunicaciones con personal altamente calificado.',
        color: 'green',
    },
    {
        icon: Package,
        title: 'Suministros',
        description: 'Suministro de materiales y equipos bajo los estándares de calidad exigidos.',
        color: 'purple',
    },
    {
        icon: Users,
        title: 'Personal Técnico',
        description: 'Recurso humano altamente calificado y certificado para cada proyecto.',
        color: 'orange',
    },
];

const colorVariants: Record<string, { bg: string; icon: string; border: string }> = {
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-500/10',
        icon: 'text-blue-600 dark:text-blue-400',
        border: 'hover:border-blue-300 dark:hover:border-blue-700',
    },
    yellow: {
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        icon: 'text-amber-600 dark:text-amber-400',
        border: 'hover:border-amber-300 dark:hover:border-amber-700',
    },
    cyan: {
        bg: 'bg-cyan-50 dark:bg-cyan-500/10',
        icon: 'text-cyan-600 dark:text-cyan-400',
        border: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    },
    green: {
        bg: 'bg-green-50 dark:bg-green-500/10',
        icon: 'text-green-600 dark:text-green-400',
        border: 'hover:border-green-300 dark:hover:border-green-700',
    },
    purple: {
        bg: 'bg-purple-50 dark:bg-purple-500/10',
        icon: 'text-purple-600 dark:text-purple-400',
        border: 'hover:border-purple-300 dark:hover:border-purple-700',
    },
    orange: {
        bg: 'bg-orange-50 dark:bg-orange-500/10',
        icon: 'text-orange-600 dark:text-orange-400',
        border: 'hover:border-orange-300 dark:hover:border-orange-700',
    },
};

export default function FeaturesSection() {
    return (
        <section id="servicios" className="py-24 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 mb-6">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            Nuestros Servicios
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Soluciones integrales para{' '}
                        <span className="gradient-text">cada necesidad</span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Prestamos servicios eficientes en todo el territorio nacional, contando con
                        tecnología de última generación y los mejores equipos disponibles en el mercado.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => {
                        const colors = colorVariants[service.color];
                        const Icon = service.icon;

                        return (
                            <div
                                key={index}
                                className={`group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colors.border}`}
                            >
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                                    <Icon className={`w-7 h-7 ${colors.icon}`} />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        ¿Necesitas más información sobre nuestros servicios?
                    </p>
                    <a
                        href="#contacto"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:gap-3 transition-all"
                    >
                        Contáctanos
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
