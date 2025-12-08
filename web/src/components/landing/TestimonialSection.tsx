import Image from 'next/image';

export default function TestimonialSection() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    {/* Background Decoration */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
                    </div>

                    {/* Quote Card */}
                    <div className="relative text-center">
                        {/* Quote Icon */}
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg mb-8">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                        </div>

                        {/* Quote Text */}
                        <blockquote className="text-2xl sm:text-3xl font-medium text-gray-900 dark:text-white leading-relaxed mb-8">
                            "Generamos soluciones eficientes a nuestros clientes, con más de quince años
                            de experiencia en construcción, mantenimiento y montajes, respaldados por
                            tecnología de última generación y un equipo humano altamente calificado."
                        </blockquote>

                        {/* Attribution */}
                        <div className="flex items-center justify-center gap-4">
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg">
                                <Image
                                    src="/logo.svg"
                                    alt="Cermont Logo"
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    CERMONT S.A.S
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Fundada el 12 de Junio de 2008
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="flex justify-center gap-2 mt-8">
                            <span className="w-12 h-1 rounded-full bg-blue-600" />
                            <span className="w-3 h-1 rounded-full bg-green-500" />
                            <span className="w-3 h-1 rounded-full bg-blue-400" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
