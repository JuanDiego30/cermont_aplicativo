/**
 * /terms — Términos y condiciones de uso
 * Server component — contenido estático legal
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Términos y condiciones",
	description:
		"Términos y condiciones de uso de la plataforma Cermont S.A.S. Aceptación, obligaciones, propiedad intelectual y ley aplicable.",
};

const LAST_UPDATED_LABEL = "30 de junio de 2026";
const COMPANY_NAME = "Cermont S.A.S.";
const COMPANY_NIT = "NIT 807.005.589-7";
const COMPANY_ADDRESS = "Pamplona, Norte de Santander, Colombia";
const COMPANY_EMAIL = "info@cermont.com.co";
const JURISDICTION_CITY = "Pamplona, Norte de Santander";

export default function TermsPage() {
	return (
		<main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
			<h1 className="text-2xl font-semibold text-[var(--text-primary)]">
				Términos y Condiciones de Uso
			</h1>
			<p className="mt-2 text-sm text-[var(--text-secondary)]">
				Última actualización: {LAST_UPDATED_LABEL}
			</p>

			<div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--text-primary)]">
				<section>
					<h2 className="text-lg font-medium">1. Aceptación de los términos</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Al acceder, registrarse o utilizar la plataforma Cermont (en adelante, &laquo;la
						Plataforma&raquo;), el usuario manifiesta su aceptación plena y sin reservas de los
						presentes Términos y Condiciones. Si el usuario no está de acuerdo con alguna parte de
						estos términos, no debe utilizar la Plataforma.
					</p>
					<p className="mt-2 text-[var(--text-secondary)]">
						Estos términos constituyen un acuerdo legal vinculante entre el usuario y {COMPANY_NAME}{" "}
						({COMPANY_NIT}).
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">2. Descripción del servicio</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Cermont es una plataforma de gestión operativa para empresas de servicios de campo que
						integra el ciclo completo de 14 pasos: solicitud de trabajo, visita técnica, propuesta,
						orden de compra, planificación, ejecución, evidencias, informe técnico, acta de entrega,
						firma del cliente, SES/Ariba, facturación, aprobación de factura y pago.
					</p>
					<p className="mt-2 text-[var(--text-secondary)]">
						La Plataforma incluye funcionalidades de captura de evidencias con geolocalización,
						sincronización offline, control de flota y herramientas, dashboards gerenciales, portal
						de cliente, facturación electrónica DIAN, y motor de automatizaciones.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">3. Registro y cuenta de usuario</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Para utilizar la Plataforma, el usuario debe registrarse y crear una cuenta. El usuario
						declara que toda la información proporcionada durante el registro es veraz, completa y
						actualizada.
					</p>
					<p className="mt-2 text-[var(--text-secondary)]">
						El usuario es el único responsable de mantener la confidencialidad de sus credenciales
						de acceso (usuario y contraseña). Cualquier actividad realizada a través de su cuenta se
						considerará realizada por el usuario. El usuario debe notificar inmediatamente a{" "}
						{COMPANY_NAME} cualquier uso no autorizado de su cuenta.
					</p>
					<p className="mt-2 text-[var(--text-secondary)]">
						{COMPANY_NAME} se reserva el derecho de asignar roles y permisos de acuerdo con la
						estructura organizacional del cliente contratante, y de desactivar cuentas que incumplan
						estos términos.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">4. Obligaciones del usuario</h2>
					<p className="mt-2 text-[var(--text-secondary)]">El usuario se compromete a:</p>
					<ol className="mt-2 list-decimal space-y-1 pl-5 text-[var(--text-secondary)]">
						<li>Proporcionar información veraz y mantenerla actualizada.</li>
						<li>
							Usar la Plataforma de conformidad con la ley, la moral, el orden público y estos
							términos.
						</li>
						<li>
							No utilizar la Plataforma para actividades ilícitas o que atenten contra derechos de
							terceros.
						</li>
						<li>No introducir virus, malware o cualquier código dañino.</li>
						<li>No intentar acceder a áreas restringidas de la Plataforma sin autorización.</li>
						<li>
							No reproducir, distribuir o modificar el contenido de la Plataforma sin autorización
							expresa.
						</li>
						<li>Capturar evidencias y registrar datos operativos de forma veraz y oportuna.</li>
						<li>
							Notificar cualquier incidente de seguridad o vulnerabilidad detectada en la
							Plataforma.
						</li>
					</ol>
				</section>

				<section>
					<h2 className="text-lg font-medium">5. Propiedad intelectual</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Todo el contenido, diseño, código fuente, bases de datos, logotipos, marcas, nombres
						comerciales, documentación y funcionalidad de la Plataforma Cermont son propiedad
						exclusiva de {COMPANY_NAME} o de sus licenciantes, y están protegidos por las leyes de
						propiedad intelectual de Colombia y los tratados internacionales aplicables.
					</p>
					<p className="mt-2 text-[var(--text-secondary)]">
						El usuario no adquiere ningún derecho de propiedad sobre el software, marcas o
						contenidos de la Plataforma. Se concede al usuario una licencia limitada, no exclusiva,
						intransferible y revocable para usar la Plataforma de acuerdo con estos términos.
					</p>
					<p className="mt-2 text-[var(--text-secondary)]">
						Los datos e información ingresados por el usuario (evidencias, informes, documentos)
						pertenecen al usuario o a la entidad que representa. {COMPANY_NAME} no reclama propiedad
						sobre dichos datos.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">6. Confidencialidad</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Las partes se comprometen a mantener la más estricta confidencialidad sobre la
						información técnica, operativa, financiera y de cualquier naturaleza que sea
						intercambiada en el marco del uso de la Plataforma. Esta obligación de confidencialidad
						se mantendrá vigente durante el término de uso y por cinco (5) años adicionales.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">7. Limitación de responsabilidad</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						En la máxima medida permitida por la ley colombiana, {COMPANY_NAME} no será responsable
						por:
					</p>
					<ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-secondary)]">
						<li>
							Daños directos, indirectos, incidentales, especiales o consecuentes derivados del uso
							o la imposibilidad de uso de la Plataforma.
						</li>
						<li>Pérdida de datos, ingresos, ganancias o ahorros anticipados.</li>
						<li>
							Interrupciones del servicio causadas por mantenimiento programado, fuerza mayor, o
							casos fortuitos.
						</li>
						<li>
							Actos de terceros no controlados por {COMPANY_NAME}, incluyendo proveedores de
							infraestructura cloud y servicios de telecomunicaciones.
						</li>
					</ul>
					<p className="mt-2 text-[var(--text-secondary)]">
						{COMPANY_NAME} sí será responsable por daños directos causados por su culpa grave o
						dolo, en los términos del Código de Comercio colombiano.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">8. Garantías</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						{COMPANY_NAME} se compromete a realizar sus mejores esfuerzos para que la Plataforma
						opere de forma continua y sin errores. Sin embargo, la Plataforma se proporciona
						&laquo;tal cual&raquo; y &laquo;según disponibilidad&raquo;, sin garantías de ningún
						tipo, ya sean expresas o implícitas.
					</p>
					<p className="mt-2 text-[var(--text-secondary)]">
						{COMPANY_NAME} no garantiza que la Plataforma sea compatible con todos los dispositivos
						o navegadores, ni que la funcionalidad offline sincronice correctamente en todas las
						condiciones de red.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">9. Disponibilidad y mantenimiento</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						{COMPANY_NAME} se reserva el derecho de realizar ventanas de mantenimiento programado
						con al menos 48 horas de antelación. Durante el mantenimiento, la Plataforma puede no
						estar disponible temporalmente. Las funcionalidades offline continuarán operando durante
						las interrupciones de conectividad.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">10. Terminación</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						{COMPANY_NAME} podrá suspender o terminar el acceso del usuario a la Plataforma en caso
						de:
					</p>
					<ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-secondary)]">
						<li>Incumplimiento de estos términos y condiciones.</li>
						<li>Uso indebido o fraudulento de la Plataforma.</li>
						<li>Solicitud expresa del cliente contratante.</li>
						<li>Cese de la relación contractual con la empresa contratante.</li>
						<li>Por requerimiento de autoridad competente.</li>
					</ul>
					<p className="mt-2 text-[var(--text-secondary)]">
						El usuario puede solicitar la cancelación de su cuenta en cualquier momento. La
						terminación no afectará los derechos y obligaciones acumulados antes de la fecha de
						terminación.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">11. Ley aplicable y jurisdicción</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Estos términos y condiciones se rigen por las leyes de la República de Colombia.
						Cualquier controversia que surja en relación con estos términos será sometida a los
						jueces y tribunales competentes de la ciudad de {JURISDICTION_CITY}, Colombia.
					</p>
					<p className="mt-2 text-[var(--text-secondary)]">
						En caso de conflicto entre los términos y las condiciones particulares de un contrato de
						servicios suscrito con {COMPANY_NAME}, prevalecerán las condiciones del contrato
						específico.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">12. Notificaciones</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Todas las notificaciones relacionadas con estos términos deberán realizarse por escrito
						a través de los siguientes canales:
					</p>
					<ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-secondary)]">
						<li>Correo electrónico: {COMPANY_EMAIL}</li>
						<li>Dirección física: {COMPANY_ADDRESS}</li>
					</ul>
				</section>

				<section>
					<h2 className="text-lg font-medium">13. Modificaciones</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						{COMPANY_NAME} se reserva el derecho de modificar estos términos en cualquier momento.
						Las modificaciones serán notificadas a los usuarios a través de la Plataforma. El uso
						continuado de la Plataforma después de la publicación de las modificaciones constituye
						la aceptación de las mismas.
					</p>
				</section>

				<section>
					<h2 className="text-lg font-medium">14. Acuerdo integral</h2>
					<p className="mt-2 text-[var(--text-secondary)]">
						Estos términos constituyen el acuerdo integral entre el usuario y {COMPANY_NAME} en
						relación con el uso de la Plataforma, y reemplazan cualquier acuerdo o entendimiento
						previo, ya sea escrito o verbal. Si cualquier disposición de estos términos es
						considerada inválida o inaplicable, las disposiciones restantes continuarán en pleno
						vigor y efecto.
					</p>
				</section>
			</div>
		</main>
	);
}
