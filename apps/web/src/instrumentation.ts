
/**
 * ARCHIVO: instrumentation.ts
 * FUNCION: OpenTelemetry y observabilidad
 * IMPLEMENTACION: Basado en vercel/examples con @vercel/otel
 * DEPENDENCIAS: @vercel/otel (opcional)
 * EXPORTS: register
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Solo registrar en servidor
    // Intentar cargar @vercel/otel si está disponible
    try {
      const { registerOTel } = await import('@vercel/otel');

      registerOTel({
        serviceName: 'cermont-web',
        attributes: {
          'deployment.environment': process.env.VERCEL_ENV || 'development',
          'service.version': process.env.VERCEL_GIT_COMMIT_SHA || 'local',
        },
      });

      console.log('[Instrumentation] OpenTelemetry registered successfully');
    } catch {
      // @vercel/otel no está instalado, usar instrumentación básica
      console.log('[Instrumentation] @vercel/otel not available, using basic instrumentation');
      // En entorno real, aquí podríamos configurar otra herramienta
    }
  }
}
