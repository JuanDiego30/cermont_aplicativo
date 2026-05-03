"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import { type PointerEvent as ReactPointerEvent, useEffect, useRef } from "react";

interface ChecklistSignatureProps {
	onChange: (signature: string | null) => void;
	disabled?: boolean;
}

export function ChecklistSignature({ onChange, disabled = false }: ChecklistSignatureProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const drawingRef = useRef(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const setupCanvas = () => {
			const context = canvas.getContext("2d");
			if (!context) {
				return;
			}

			const rect = canvas.getBoundingClientRect();
			const scale = window.devicePixelRatio || 1;

			canvas.width = Math.max(1, Math.round(rect.width * scale));
			canvas.height = Math.max(1, Math.round(rect.height * scale));

			context.setTransform(scale, 0, 0, scale, 0, 0);
			context.lineCap = "round";
			context.lineJoin = "round";
			context.lineWidth = 2.5;
			context.strokeStyle = "#0f172a";
			context.fillStyle = "#ffffff";
			context.fillRect(0, 0, rect.width, rect.height);
		};

		setupCanvas();

		window.addEventListener("resize", setupCanvas);
		return () => window.removeEventListener("resize", setupCanvas);
	}, []);

	const getCanvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return { x: 0, y: 0 };
		}

		const rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		};
	};

	const drawPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
		if (disabled) {
			return;
		}

		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (!canvas || !context || !drawingRef.current) {
			return;
		}

		const { x, y } = getCanvasPoint(event);
		context.lineTo(x, y);
		context.stroke();
	};

	const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
		if (disabled) {
			return;
		}

		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (!canvas || !context) {
			return;
		}

		drawingRef.current = true;
		const { x, y } = getCanvasPoint(event);
		context.beginPath();
		context.moveTo(x, y);
		canvas.setPointerCapture(event.pointerId);
		event.preventDefault();
	};

	const finishDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
		if (disabled) {
			return;
		}

		const canvas = canvasRef.current;
		if (!canvas || !drawingRef.current) {
			return;
		}

		drawingRef.current = false;
		if (canvas.hasPointerCapture(event.pointerId)) {
			canvas.releasePointerCapture(event.pointerId);
		}
		onChange(canvas.toDataURL("image/png"));
		event.preventDefault();
	};

	const handleClear = () => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (!canvas || !context) {
			return;
		}

		drawingRef.current = false;
		const rect = canvas.getBoundingClientRect();
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.restore();
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, rect.width, rect.height);
		onChange(null);
	};

	return (
		<section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
			<div className="flex items-start justify-between gap-3">
				<div>
					<h3 className="text-sm font-semibold text-slate-900 dark:text-white">Firma digital</h3>
					<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
						Dibuja con el dedo, stylus o mouse. La firma se envia al firmar el checklist.
					</p>
				</div>

				<button
					type="button"
					onClick={handleClear}
					disabled={disabled}
					className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
				>
					<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
					Limpiar
				</button>
			</div>

			<div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
				<canvas
					ref={canvasRef}
					className={
						disabled
							? "h-40 w-full cursor-not-allowed opacity-60"
							: "h-40 w-full touch-none cursor-crosshair"
					}
					aria-label="Area para firma digital"
					onPointerDown={handlePointerDown}
					onPointerMove={drawPoint}
					onPointerUp={finishDrawing}
					onPointerLeave={finishDrawing}
				/>
			</div>

			<div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
				<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
				Si la firma no queda visible, repite el trazo con un movimiento mas lento.
			</div>
		</section>
	);
}
