import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center hero-pattern overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-breath" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-breath" style={{ animationDelay: '2s' }} />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(0 0 0 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
                    }}
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-6">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                Más de 15 años de experiencia
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                            Soluciones Integrales en{' '}
                            <span className="gradient-text">
                                Refrigeración Industrial
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                            Ofrecemos servicios de construcción, electricidad, refrigeración, montajes y suministros con los más altos estándares de calidad y tecnología de última generación.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="/login" className="btn-primary">
                                Acceder al Sistema
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <a href="#servicios" className="btn-secondary">
                                Conocer Servicios
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">2008</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Fundada</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">15+</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Años de Experiencia</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">100%</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Cobertura Nacional</div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image/Illustration */}
                    <div className="relative hidden lg:block">
                        <div className="relative w-full aspect-square max-w-lg mx-auto">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 gradient-bg rounded-3xl blur-3xl opacity-20 animate-breath" />

                            {/* Main Card */}
                            <div className="relative glass rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                                {/* Logo */}
                                <div className="w-24 h-24 mx-auto mb-6">
                                    <Image
                                        src="/logo.svg"
                                        alt="Cermont Logo"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Company Name */}
                                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                                    CERMONT S.A.S
                                </h2>
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
                                    Sistema de Gestión de Órdenes de Trabajo
                                </p>

                                {/* Features List */}
                                <div className="space-y-3">
                                    {[
                                        'Gestión de Ordenes de Trabajo',
                                        'Control de Planes de Trabajo',
                                        'Registro de Evidencias',
                                        'Reportes en Tiempo Real',
                                    ].map((feature, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                                        >
                                            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {feature}
                                            </span>
                                        </div>
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
