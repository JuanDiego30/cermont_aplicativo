/**
 * DispatchService — Route optimization and technician scheduling
 *
 * Uses OSRM (Open Source Routing Machine) for route calculation.
 * OSRM public API: https://project-osrm.org/
 * Free tier: https://router.project-osrm.org/
 *
 * Falls back to straight-line distance estimation when OSRM is unavailable.
 */

import type {
	DispatchGeocodeResult,
	DispatchStop,
	DispatchTechnician,
	GeoCoordinate,
	OptimizedRoute,
	TechnicianAssignment,
} from "@cermont/shared-types";
import { createLogger } from "../../common/utils/logger";
import { Order } from "../../models";

const log = createLogger("dispatch-service");

const OSRM_BASE = "https://router.project-osrm.org";

function haversineDistanceKm(a: GeoCoordinate, b: GeoCoordinate): number {
	const R = 6371;
	const dLat = ((b.lat - a.lat) * Math.PI) / 180;
	const dLng = ((b.lng - a.lng) * Math.PI) / 180;
	const sinDLat = Math.sin(dLat / 2);
	const sinDLng = Math.sin(dLng / 2);
	const h =
		sinDLat * sinDLat +
		Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinDLng * sinDLng;
	return 2 * R * Math.asin(Math.sqrt(h));
}

/** Nearest‑neighbor heuristic TSP solver for stop ordering */
function nearestNeighbor(stops: DispatchStop[]): string[] {
	if (stops.length <= 1) {
		return stops.map((stop) => stop.id);
	}

	const ordered: string[] = [];
	const remaining = [...stops];
	const firstStop = remaining.shift();
	if (!firstStop) {
		return ordered;
	}
	let current = firstStop;
	ordered.push(current.id);

	while (remaining.length > 0) {
		let nearestIdx = 0;
		let nearestDist = Infinity;
		for (let i = 0; i < remaining.length; i++) {
			const candidate = remaining[i];
			if (!candidate) {
				continue;
			}
			const d = haversineDistanceKm(current.coord, candidate.coord);
			if (d < nearestDist) {
				nearestDist = d;
				nearestIdx = i;
			}
		}
		const nextStop = remaining.splice(nearestIdx, 1)[0];
		if (!nextStop) {
			break;
		}
		current = nextStop;
		ordered.push(current.id);
	}

	return ordered;
}

/** Build coordinate string for OSRM API */
function coordsStr(stops: DispatchStop[]): string {
	return stops.map((s) => `${s.coord.lng},${s.coord.lat}`).join(";");
}

const OSRM_CACHE = new Map<string, { distance: number; duration: number }>();
const OSRM_CACHE_TTL = 5 * 60 * 1000; // 5 min
const OSRM_CACHE_TIMESTAMPS = new Map<string, number>();

async function callOsrm(coordStr: string): Promise<{ distance: number; duration: number } | undefined> {
	const cached = OSRM_CACHE.get(coordStr);
	const ts = OSRM_CACHE_TIMESTAMPS.get(coordStr);
	if (cached && ts && Date.now() - ts < OSRM_CACHE_TTL) {
		return cached;
	}

	try {
		const url = `${OSRM_BASE}/route/v1/driving/${coordStr}?overview=false`;
		const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
		if (!res.ok) {
			log.warn("OSRM route request failed", { status: res.status });
			return undefined;
		}
		const body = (await res.json()) as {
			code: string;
			routes: Array<{ distance: number; duration: number }>;
		};
		const firstRoute = body.routes[0];
		if (body.code !== "Ok" || !firstRoute) {
			log.warn("OSRM route response did not contain a route", { code: body.code });
			return undefined;
		}
		const data = {
			distance: firstRoute.distance / 1000,
			duration: firstRoute.duration / 60,
		};
		OSRM_CACHE.set(coordStr, data);
		OSRM_CACHE_TIMESTAMPS.set(coordStr, Date.now());
		return data;
	} catch (error) {
		log.warn("OSRM route provider unavailable", {
			error: error instanceof Error ? error.message : String(error),
		});
		return undefined;
	}
}

function createAssignments(technicians: DispatchTechnician[]): TechnicianAssignment[] {
	return technicians.map((technician) => ({
		technicianId: technician.id,
		technicianName: technician.name,
		scheduledStops: [],
		totalDistanceKm: 0,
		totalDurationMin: 0,
		startLocation: technician.startLocation,
	}));
}

function getCurrentCoordinate(
	assignment: TechnicianAssignment,
	stopsById: ReadonlyMap<string, DispatchStop>,
): GeoCoordinate {
	const lastStopId = assignment.scheduledStops.at(-1);
	if (!lastStopId) {
		return assignment.startLocation;
	}
	return stopsById.get(lastStopId)?.coord ?? assignment.startLocation;
}

function findNearestStopIndex(origin: GeoCoordinate, stops: DispatchStop[]): number {
	let nearestIndex = 0;
	let nearestDistance = Number.POSITIVE_INFINITY;

	for (const [index, candidate] of stops.entries()) {
		const distance = haversineDistanceKm(origin, candidate.coord);
		if (distance < nearestDistance) {
			nearestDistance = distance;
			nearestIndex = index;
		}
	}

	return nearestIndex;
}

function assignStopsRoundRobin(
	assignments: TechnicianAssignment[],
	stops: DispatchStop[],
): TechnicianAssignment[] {
	const remaining = [...stops];
	const stopsById = new Map(stops.map((stop) => [stop.id, stop]));
	let round = 0;

	while (remaining.length > 0) {
		const assignment = assignments[round % assignments.length];
		if (!assignment) {
			break;
		}

		const currentCoordinate = getCurrentCoordinate(assignment, stopsById);
		const nearestIndex = findNearestStopIndex(currentCoordinate, remaining);
		const assignedStop = remaining.splice(nearestIndex, 1)[0];
		if (!assignedStop) {
			break;
		}

		assignment.scheduledStops.push(assignedStop.id);
		assignment.totalDistanceKm +=
			Math.round(haversineDistanceKm(currentCoordinate, assignedStop.coord) * 10) / 10;
		assignment.totalDurationMin += assignedStop.estimatedDuration ?? 30;
		round += 1;
	}

	return assignments;
}

export const DispatchService = {
	/**
	 * Optimize route order for a set of stops using nearest-neighbor + OSRM validation
	 */
	async optimizeRoute(stops: DispatchStop[]): Promise<OptimizedRoute> {
		if (stops.length === 0) {
			return {
				stops: [],
				totalDistanceKm: 0,
				totalDurationMin: 0,
				orderedIds: [],
			};
		}

		// Order by TSP nearest-neighbor
		const orderedIds = nearestNeighbor(stops);
		const stopsById = new Map(stops.map((stop) => [stop.id, stop]));
		const ordered = orderedIds.flatMap((id) => {
			const stop = stopsById.get(id);
			return stop ? [stop] : [];
		});

		// Try OSRM for real distance/duration
		let totalDistanceKm = 0;
		let totalDurationMin = 0;

		if (ordered.length >= 2) {
			const cs = coordsStr(ordered);
			const osrm = await callOsrm(cs);
			if (osrm) {
				totalDistanceKm = Math.round(osrm.distance * 10) / 10;
				totalDurationMin = Math.round(osrm.duration);
			} else {
				// Fallback to straight-line sum
				for (let i = 1; i < ordered.length; i++) {
					const previous = ordered[i - 1];
					const current = ordered[i];
					if (!previous || !current) {
						continue;
					}
					totalDistanceKm +=
						Math.round(haversineDistanceKm(previous.coord, current.coord) * 10) / 10;
					totalDurationMin += current.estimatedDuration ?? 30;
				}
			}
		}

		return { stops: ordered, totalDistanceKm, totalDurationMin, orderedIds };
	},

	/**
	 * Assign stops to multiple technicians (load balancing)
	 */
	async assignTechnicians(
		technicians: DispatchTechnician[],
		stops: DispatchStop[],
	): Promise<TechnicianAssignment[]> {
		if (technicians.length === 0) {
			return [];
		}
		if (technicians.length === 1) {
			const opt = await this.optimizeRoute(stops);
			const technician = technicians[0];
			if (!technician) {
				return [];
			}
			return [
				{
					technicianId: technician.id,
					technicianName: technician.name,
					scheduledStops: opt.orderedIds,
					totalDistanceKm: opt.totalDistanceKm,
					totalDurationMin: opt.totalDurationMin,
					startLocation: technician.startLocation,
				},
			];
		}

		return assignStopsRoundRobin(createAssignments(technicians), stops);
	},

	/** Free‑text geocode via Nominatim (OpenStreetMap) */
	async geocode(query: string): Promise<DispatchGeocodeResult> {
		try {
			const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
			const res = await fetch(url, {
				headers: { "User-Agent": "CermontDispatch/1.0" },
				signal: AbortSignal.timeout(5000),
			});
			if (!res.ok) {
				log.warn("Nominatim geocoding request failed", { status: res.status });
				return {
					status: "unavailable",
					reason: "GEOCODING_PROVIDER_UNAVAILABLE",
				};
			}
			const body = (await res.json()) as Array<{ lat: string; lon: string }>;
			const firstMatch = body[0];
			if (!firstMatch) {
				return { status: "not_found", reason: "ADDRESS_NOT_FOUND" };
			}
			return {
				status: "found",
				coordinate: {
					lat: Number.parseFloat(firstMatch.lat),
					lng: Number.parseFloat(firstMatch.lon),
				},
			};
		} catch (error) {
			log.warn("Nominatim geocoding provider unavailable", {
				error: error instanceof Error ? error.message : String(error),
			});
			return {
				status: "unavailable",
				reason: "GEOCODING_PROVIDER_UNAVAILABLE",
			};
		}
	},
};

interface ActiveOrderWithCoords {
	orderId: string;
	code: string;
	clientName: string;
	status: string;
	coord: { lat: number; lng: number };
	serviceSite: string;
}

export async function getActiveOrdersWithCoords(): Promise<ActiveOrderWithCoords[]> {
	const orders = await Order.find({
		status: { $in: ["in_progress", "assigned", "active", "planning"] },
	})
		.sort({ createdAt: -1 })
		.limit(100)
		.lean();

	return orders
		.map((order) => {
			const o = order as unknown as Record<string, unknown>;
			const lat = typeof o.lat === "number" ? o.lat : 7.0845;
			const lng = typeof o.lng === "number" ? o.lng : -70.7592;
			return {
				orderId: String(o._id ?? ""),
				code: String(o.code ?? ""),
				clientName: String(o.clientName ?? o.client ?? ""),
				status: String(o.status ?? ""),
				coord: { lat, lng },
				serviceSite: String(o.serviceSite ?? o.location ?? "Arauca"),
			};
		})
		.filter((order) => order.orderId !== "");
}
