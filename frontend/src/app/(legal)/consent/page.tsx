/**
 * /consent — Consentimiento de datos
 * Server component
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Consentimiento de datos",
	description: "Finalidades y alcance del consentimiento para el tratamiento de datos en Cermont.",
};

const LAST_UPDATED_LABEL = "27 de junio de 2026";

export default function ConsentPage() {
	return (
		<main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
			<h1 className="text-2xl font-semibold text-[var(--text-primary)]">Consentimiento de Datos</h1>
			<p className="mt-2 text-sm text-[var(--text-secondary)]">
				Última actualización: {LAST_UPDATED_LABEL}
			</p>

			<div className="mt-8 space-y-6 text-sm text-[var(--text-primary)] leading-relaxed">
				<section>
					<h2 className="text-lg font-medium">¿Para qué necesitamos tu consentimiento?</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Al usar el sistema Cermont, autorizas el tratamiento de tus datos personales y
						operativos para las finalidades descritas en nuestra Política de Privacidad.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">¿Qué datos autorizas?</h2>
					<ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-secondary)]">
						<li>Datos de identificación y contacto</li>
						<li>Registro de ubicación GPS durante la ejecución</li>
						<li>Evidencias fotográficas de los servicios</li>
						<li>Registros de tiempo y materiales utilizados</li>
						<li>Firmas digitales</li>
					</ul>
				</section>

				<section>
					<h2 className="text-lg font-medium">Derechos del titular</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO)
						contactando al administrador del sistema. También puedes solicitar la portabilidad de
						tus datos.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">Revocación</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Puedes revocar este consentimiento en cualquier momento, pero esto puede afectar tu
						capacidad para usar el sistema. La revocación no afecta la licitud del tratamiento
						basado en el consentimiento previo.
					</p>
				</section>
			</div>
		</main>
	);
}
