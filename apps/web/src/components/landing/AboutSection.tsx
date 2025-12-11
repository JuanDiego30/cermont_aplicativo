import {
    Target,
    Eye,
    Shield,
    TrendingUp,
    Heart,
    Users,
    Award,
    Leaf
} from 'lucide-react';

const values = [
    { icon: Award, label: 'Calidad' },
    { icon: TrendingUp, label: 'Eficiencia' },
    { icon: Target, label: 'Efectividad' },
    { icon: Shield, label: 'Seguridad' },
    { icon: Heart, label: 'Responsabilidad' },
    { icon: Users, label: 'Trabajo en Equipo' },
    { icon: Leaf, label: 'Desarrollo Sostenible' },
];

export default function AboutSection() {
    return (
        <section id="nosotros" className="py-24 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <div>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-6">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                Sobre Nosotros
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            Más de <span className="gradient-text">15 años</span> construyendo confianza
                        </h2>

                        {/* Mission */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Misión
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-13">
                                Prestar en todo el territorio nacional un servicio eficiente en construcción,
                                mantenimiento, montajes de obras civiles, eléctricas, refrigeración,
                                telecomunicaciones, suministros de materiales, equipos y personal técnico,
                                contando con un recurso humano altamente calificado y tecnología de última generación.
                            </p>
                        </div>

                        {/* Vision */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Visión 2026
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-13">
                                Ser una empresa rentable, sólida y en continuo crecimiento, con la mayor
                                participación en el mercado nacional, por la idoneidad de su personal competente,
                                tecnología de última generación, responsabilidad social, alto desempeño y
                                compromiso con el desarrollo sostenible.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <div className="text-3xl font-bold gradient-text">12</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Junio 2008</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold gradient-text">5</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Áreas de Servicio</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold gradient-text">100%</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Compromiso</div>
                            </div>
                        </div>
                    </div>

                    {/* Values Card */}
                    <div className="relative">
                        {/* Background Decoration */}
                        <div className="absolute inset-0 gradient-bg rounded-3xl blur-3xl opacity-10" />

                        <div className="relative glass rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                                Nuestros Valores
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                {values.map((value, index) => {
                                    const Icon = value.icon;
                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {value.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Certifications */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Certificaciones y Políticas
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {['SG-SST', 'PESV', 'Calidad', 'Ambiental'].map((cert, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-xs font-medium rounded-full bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                                        >
                                            {cert}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
