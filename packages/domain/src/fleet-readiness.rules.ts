/**
 * Fleet Readiness Rules — Vehicle readiness score and blockers
 *
 * Determines if a vehicle is ready for assignment based on:
 * - Document expiry status (SOAT, tecnomecanica, insurance)
 * - Maintenance status
 */

export interface VehicleDocumentStatus {
	soatExpiry?: string;
	technoMechanicalExpiry?: string;
	insuranceExpiry?: string;
	lastMaintenanceAt?: string;
	status: string;
}

export interface FleetReadiness {
	ready: boolean;
	score: number;
	blockers: FleetBlocker[];
	expiringSoon: FleetBlocker[];
}

export interface FleetBlocker {
	code: string;
	message: string;
	severity: "error" | "warning";
}

const DAYS_WARNING = 30;
const DAYS_CRITICAL = 0;

function daysUntil(dateStr: string): number {
	const diff = new Date(dateStr).getTime() - Date.now();
	return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getExpiryBlocker(
	label: string,
	field: string,
	expiryDate?: string,
): FleetBlocker | null {
	if (!expiryDate) {
		return {
			code: `MISSING_${field.toUpperCase()}`,
			message: `${label} no registrado`,
			severity: "error",
		};
	}
	const days = daysUntil(expiryDate);
	if (days <= DAYS_CRITICAL) {
		return {
			code: `EXPIRED_${field.toUpperCase()}`,
			message: `${label} vencido (${Math.abs(days)} días)`,
			severity: "error",
		};
	}
	if (days <= DAYS_WARNING) {
		return {
			code: `EXPIRING_${field.toUpperCase()}`,
			message: `${label} vence en ${days} días`,
			severity: "warning",
		};
	}
	return null;
}

export function evaluateFleetReadiness(vehicle: VehicleDocumentStatus): FleetReadiness {
	const errors: FleetBlocker[] = [];
	const warnings: FleetBlocker[] = [];

	const soatBlocker = getExpiryBlocker("SOAT", "soat", vehicle.soatExpiry);
	if (soatBlocker) {
		if (soatBlocker.severity === "error") errors.push(soatBlocker);
		else warnings.push(soatBlocker);
	}

	const techBlocker = getExpiryBlocker("Tecnomecánica", "technomechanical", vehicle.technoMechanicalExpiry);
	if (techBlocker) {
		if (techBlocker.severity === "error") errors.push(techBlocker);
		else warnings.push(techBlocker);
	}

	const insBlocker = getExpiryBlocker("Póliza", "insurance", vehicle.insuranceExpiry);
	if (insBlocker) {
		if (insBlocker.severity === "error") errors.push(insBlocker);
		else warnings.push(insBlocker);
	}

	if (vehicle.status === "maintenance") {
		errors.push({
			code: "IN_MAINTENANCE",
			message: "Vehículo en mantenimiento",
			severity: "error",
		});
	}

	const blocker: FleetBlocker[] = errors;
	const expiringSoon: FleetBlocker[] = warnings;
	const totalChecks = 4;
	const passed = totalChecks - errors.length - warnings.length * 0.5;
	const score = Math.round((passed / totalChecks) * 100);

	return {
		ready: errors.length === 0,
		score: Math.min(100, score),
		blockers: errors,
		expiringSoon,
	};
}
