import { CloudOff, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { MOTION } from "@/components/motion/motion-classes";
import { Button } from "@/core/ui/Button";
import { cn } from "@/lib/utils";

interface PageStateShellProps {
	title: string;
	description: string;
	icon: ReactNode;
	action?: ReactNode;
	secondaryAction?: ReactNode;
	className?: string;
}

function PageStateShell({
	title,
	description,
	icon,
	action,
	secondaryAction,
	className,
}: PageStateShellProps) {
	return (
		<section
			className={cn(
				`${MOTION.revealUp} motion-panel flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 py-14 text-center`,
				className,
			)}
		>
			<div className="motion-subtle flex size-14 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--text-tertiary)]">
				{icon}
			</div>
			<div className="space-y-2">
				<h2 className="text-base font-semibold text-[var(--text-primary)] [text-wrap:balance]">
					{title}
				</h2>
				<p className="mx-auto max-w-md text-sm text-[var(--text-secondary)]">{description}</p>
			</div>
			{action || secondaryAction ? (
				<div className="flex flex-wrap justify-center gap-3">
					{action}
					{secondaryAction}
				</div>
			) : null}
		</section>
	);
}

/**
 * BackendUnavailableState — used when the API proxy returns 503 / BACKEND_UNAVAILABLE.
 *
 * Distinct from ErrorState because the failure is operational (Express server down,
 * MongoDB unreachable, port closed), not a bug. Communicates the situation in plain
 * language and offers a retry that re-fires the failed query without a full reload.
 */
export function BackendUnavailableState(props: {
	title?: string;
	description?: string;
	onRetry?: () => void;
	className?: string;
}) {
	return (
		<PageStateShell
			title={props.title ?? "Servicio no disponible"}
			description={
				props.description ??
				"No pudimos conectar con el servidor. Tus datos locales siguen disponibles y la aplicación intentará reconectar automáticamente."
			}
			icon={<CloudOff className="size-6 text-[var(--color-warning)]" aria-hidden="true" />}
			action={
				props.onRetry ? (
					<Button onClick={props.onRetry} size="sm" className="gap-2" variant="secondary">
						<RotateCcw className="size-3.5" />
						Reintentar
					</Button>
				) : undefined
			}
			className={props.className}
		/>
	);
}
