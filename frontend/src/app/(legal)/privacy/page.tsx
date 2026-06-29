/**
 * /privacy — Política de privacidad
 * Server component — sin interactividad
 */

export default function PrivacyPage() {
	return (
		<main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
			<h1 className="text-2xl font-semibold text-[var(--text-primary)]">
				Política de Privacidad
			</h1>
			<p className="mt-2 text-sm text-[var(--text-secondary)]">
				Última actualización: {new Date().toLocaleDateString("es-CO")}
			</p>

			<div className="mt-8 space-y-6 text-sm text-[var(--text-primary)] leading-relaxed">
				<section>
					<h2 className="text-lg font-medium">1. Datos que recopilamos</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Recopilamos datos personales necesarios para la operación del sistema Cermont,
						incluyendo: nombre, correo electrónico, rol, número de contacto, y datos de
						identificación. También recopilamos datos operativos como evidencias fotográficas,
						ubicación GPS, y registros de ejecución de servicios.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">2. Uso de los datos</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Los datos se utilizan únicamente para: gestión de órdenes de trabajo, control de
						calidad, facturación, reportes operativos, y cumplimiento de requisitos
						contractuales con nuestros clientes. No compartimos datos personales con terceros
						sin consentimiento explícito.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">3. Retención y eliminación</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Los datos se conservan mientras sean necesarios para fines operativos y legales.
						Los usuarios pueden solicitar la eliminación de sus datos personales mediante
						una solicitud formal al equipo de administración. Los registros de auditoría se
						conservan de forma inmutable.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">4. Seguridad</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Implementamos medidas técnicas y organizativas para proteger los datos: cifrado
						en tránsito (TLS), autenticación basada en JWT, control de acceso basado en
						roles (RBAC), y auditoría de todas las acciones críticas.
					</p>
				</section>
			</div>
		</main>
	);
}
