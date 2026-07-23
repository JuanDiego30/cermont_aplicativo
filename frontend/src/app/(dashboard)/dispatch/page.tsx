"use client";

import type {
	DispatchStop,
	DispatchTechnician,
	OptimizedRoute,
	TechnicianAssignment,
} from "@cermont/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
	assignDispatchTechnicians,
	geocodeDispatchAddress,
	optimizeDispatchRoute,
} from "@/modules/dispatch/api";
import { DispatchControls } from "./DispatchControls";
import type { DispatchMapHandle } from "./DispatchMap";
import { DispatchResults } from "./DispatchResults";

const DispatchMap = dynamic(
	() => import("./DispatchMap").then((module) => ({ default: module.DispatchMap })),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-64 items-center justify-center rounded-lg bg-surface-secondary text-sm text-muted-foreground">
				Cargando mapa...
			</div>
		),
	},
);

type ValueState<T> = { status: "idle" } | { status: "ready"; value: T };
type NoticeState =
	| { status: "idle" }
	| { status: "error"; message: string }
	| { status: "success"; message: string };

type GeocodeRequest =
	| { kind: "stop"; label: string; address: string }
	| { kind: "technician"; name: string; address: string };

interface DispatchPageState {
	stops: DispatchStop[];
	technicians: DispatchTechnician[];
	routeState: ValueState<OptimizedRoute>;
	assignmentState: ValueState<TechnicianAssignment[]>;
	notice: NoticeState;
}

type DispatchPageAction =
	| { type: "ADD_STOP"; stop: DispatchStop }
	| { type: "REMOVE_STOP"; id: string }
	| { type: "ADD_TECHNICIAN"; technician: DispatchTechnician }
	| { type: "REMOVE_TECHNICIAN"; id: string }
	| { type: "SET_OPTIMIZED_ROUTE"; route: OptimizedRoute }
	| { type: "SET_ASSIGNMENTS"; assignments: TechnicianAssignment[] }
	| { type: "SET_NOTICE"; notice: NoticeState };

const INITIAL_DISPATCH_STATE: DispatchPageState = {
	stops: [],
	technicians: [],
	routeState: { status: "idle" },
	assignmentState: { status: "idle" },
	notice: { status: "idle" },
};

function dispatchPageReducer(
	state: DispatchPageState,
	action: DispatchPageAction,
): DispatchPageState {
	switch (action.type) {
		case "ADD_STOP":
			return {
				...state,
				stops: [...state.stops, action.stop],
				routeState: { status: "idle" },
				assignmentState: { status: "idle" },
			};
		case "REMOVE_STOP":
			return {
				...state,
				stops: state.stops.filter((s) => s.id !== action.id),
				routeState: { status: "idle" },
				assignmentState: { status: "idle" },
			};
		case "ADD_TECHNICIAN":
			return {
				...state,
				technicians: [...state.technicians, action.technician],
				assignmentState: { status: "idle" },
			};
		case "REMOVE_TECHNICIAN":
			return {
				...state,
				technicians: state.technicians.filter((t) => t.id !== action.id),
				assignmentState: { status: "idle" },
			};
		case "SET_OPTIMIZED_ROUTE":
			return { ...state, routeState: { status: "ready", value: action.route } };
		case "SET_ASSIGNMENTS":
			return { ...state, assignmentState: { status: "ready", value: action.assignments } };
		case "SET_NOTICE":
			return { ...state, notice: action.notice };
	}
}

export default function DispatchPage() {
	const queryClient = useQueryClient();
	const dispatchMapRef = useRef<DispatchMapHandle>(null);
	const [state, dispatch] = useReducer(dispatchPageReducer, INITIAL_DISPATCH_STATE);
	const stateRef = useRef(state);
	const idCounter = useRef(0);
	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	const nextId = useCallback((prefix: string) => {
		idCounter.current += 1;
		return `${prefix}-${Date.now()}-${idCounter.current}`;
	}, []);

	const geocodeMutation = useMutation({
		mutationFn: async (request: GeocodeRequest) => ({
			request,
			result: await geocodeDispatchAddress(
				request.kind === "stop" ? request.address : request.address,
			),
		}),
		onSuccess: ({ request, result }) => {
			queryClient.invalidateQueries({ queryKey: ["dispatch"] });
			if (result.status !== "found") {
				dispatch({
					type: "SET_NOTICE",
					notice: {
						status: "error",
						message:
							result.status === "not_found"
								? "No se encontro la direccion. Verifique ciudad, via y numero."
								: "El proveedor de geocodificacion no esta disponible. Intente nuevamente.",
					},
				});
				return;
			}

			if (request.kind === "stop") {
				const newStop: DispatchStop = {
					id: nextId("stop"),
					label: request.label,
					address: request.address,
					coord: result.coordinate,
					priority: "media",
					estimatedDuration: 30,
					type: "service",
				};
				const currentStops = stateRef.current.stops;
				dispatchMapRef.current?.updateMarkers([...currentStops, newStop]);
				dispatch({ type: "ADD_STOP", stop: newStop });
				dispatch({
					type: "SET_NOTICE",
					notice: { status: "success", message: "Parada geolocalizada y agregada." },
				});
			} else {
				const newTechnician: DispatchTechnician = {
					id: nextId("tech"),
					name: request.name,
					startLocation: result.coordinate,
				};
				dispatch({ type: "ADD_TECHNICIAN", technician: newTechnician });
				dispatch({
					type: "SET_NOTICE",
					notice: { status: "success", message: "Tecnico y punto de salida agregados." },
				});
			}
		},
		onError: (error) => {
			dispatch({
				type: "SET_NOTICE",
				notice: {
					status: "error",
					message: error instanceof Error ? error.message : "No se pudo geolocalizar la direccion.",
				},
			});
		},
	});

	const optimizeMutation = useMutation({
		mutationFn: optimizeDispatchRoute,
		onSuccess: (route) => {
			dispatch({ type: "SET_OPTIMIZED_ROUTE", route });
			dispatchMapRef.current?.updateMarkers(route.stops);
			dispatch({
				type: "SET_NOTICE",
				notice: { status: "success", message: "Ruta optimizada correctamente." },
			});
			queryClient.invalidateQueries({ queryKey: ["dispatch"] });
		},
		onError: (error) => {
			dispatch({
				type: "SET_NOTICE",
				notice: {
					status: "error",
					message: error instanceof Error ? error.message : "No se pudo optimizar la ruta.",
				},
			});
		},
	});

	const assignmentMutation = useMutation({
		mutationFn: () =>
			assignDispatchTechnicians(stateRef.current.technicians, stateRef.current.stops),
		onSuccess: (assignments) => {
			dispatch({ type: "SET_ASSIGNMENTS", assignments });
			dispatch({
				type: "SET_NOTICE",
				notice: { status: "success", message: "Paradas asignadas a los tecnicos." },
			});
			queryClient.invalidateQueries({ queryKey: ["dispatch"] });
		},
		onError: (error) => {
			dispatch({
				type: "SET_NOTICE",
				notice: {
					status: "error",
					message: error instanceof Error ? error.message : "No se pudo asignar la ruta.",
				},
			});
		},
	});

	const removeStop = useCallback((id: string) => {
		const currentStops = stateRef.current.stops;
		const newStops = currentStops.filter((stop) => stop.id !== id);
		dispatchMapRef.current?.updateMarkers(newStops);
		dispatch({ type: "REMOVE_STOP", id });
	}, []);

	const removeTechnician = useCallback((id: string) => {
		dispatch({ type: "REMOVE_TECHNICIAN", id });
	}, []);

	return (
		<section className="mx-auto max-w-7xl space-y-6 px-4 py-8" aria-labelledby="dispatch-title">
			<header className="flex items-center gap-3">
				<div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-brand-annotate dark:bg-emerald-900/30 dark:text-brand-annotate">
					<Truck className="size-5" aria-hidden="true" />
				</div>
				<div>
					<h1 id="dispatch-title" className="text-xl font-semibold text-foreground">
						Despacho y optimizacion de rutas
					</h1>
					<p className="mt-0.5 text-sm text-muted-foreground">
						Geolocalice paradas, optimice recorridos y distribuya trabajo de campo.
					</p>
				</div>
			</header>

			{state.notice.status !== "idle" ? (
				<div
					className={
						state.notice.status === "error"
							? "rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
							: "rounded-xl border border-green-200 bg-success-bg px-4 py-3 text-sm text-brand-annotate"
					}
					role={state.notice.status === "error" ? "alert" : "status"}
				>
					{state.notice.message}
				</div>
			) : null}

			<div className="grid gap-6 lg:grid-cols-3">
				<DispatchControls
					stops={state.stops}
					technicians={state.technicians}
					onAddStop={(label, address) => geocodeMutation.mutate({ kind: "stop", label, address })}
					onAddTechnician={(name, address) =>
						geocodeMutation.mutate({ kind: "technician", name, address })
					}
					onRemoveStop={removeStop}
					onRemoveTechnician={removeTechnician}
					onOptimize={() => optimizeMutation.mutate(state.stops)}
					onAssign={() => assignmentMutation.mutate()}
					isGeocoding={geocodeMutation.isPending}
					isOptimizing={optimizeMutation.isPending}
					isAssigning={assignmentMutation.isPending}
				/>

				<div className="space-y-4 lg:col-span-2">
					<div className="overflow-hidden rounded-xl border border-border-default">
						<DispatchMap ref={dispatchMapRef} />
					</div>
					<DispatchResults
						route={state.routeState.status === "ready" ? state.routeState.value : "idle"}
						assignments={
							state.assignmentState.status === "ready" ? state.assignmentState.value : "idle"
						}
					/>
				</div>
			</div>
		</section>
	);
}
