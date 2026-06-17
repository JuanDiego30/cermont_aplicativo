"use client";

/**
 * SignaturePad — Captura de firma manuscrita por canvas (touch + mouse).
 * Exporta la firma como PNG base64 vía onChange.
 */

import { Eraser } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SignaturePadProps {
	onChange: (dataUrl: string, method: "canvas_touch" | "canvas_mouse") => void;
	height?: number;
}

export function SignaturePad({ onChange, height = 200 }: SignaturePadProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const isDrawingRef = useRef(false);
	const lastMethodRef = useRef<"canvas_touch" | "canvas_mouse">("canvas_mouse");
	const [hasStrokes, setHasStrokes] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		const ratio = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * ratio;
		canvas.height = rect.height * ratio;
		const ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.scale(ratio, ratio);
			ctx.lineWidth = 2;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.strokeStyle = "#1a2b4a";
		}
	}, []);

	const getPoint = useCallback((event: PointerEvent | React.PointerEvent) => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return { x: 0, y: 0 };
		}
		const rect = canvas.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}, []);

	const emitChange = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		onChange(canvas.toDataURL("image/png"), lastMethodRef.current);
	}, [onChange]);

	function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
		event.preventDefault();
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) {
			return;
		}
		canvas.setPointerCapture(event.pointerId);
		isDrawingRef.current = true;
		lastMethodRef.current = event.pointerType === "touch" ? "canvas_touch" : "canvas_mouse";
		const point = getPoint(event);
		ctx.beginPath();
		ctx.moveTo(point.x, point.y);
	}

	function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
		if (!isDrawingRef.current) {
			return;
		}
		event.preventDefault();
		const ctx = canvasRef.current?.getContext("2d");
		if (!ctx) {
			return;
		}
		const point = getPoint(event);
		ctx.lineTo(point.x, point.y);
		ctx.stroke();
		if (!hasStrokes) {
			setHasStrokes(true);
		}
	}

	function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
		if (!isDrawingRef.current) {
			return;
		}
		isDrawingRef.current = false;
		canvasRef.current?.releasePointerCapture(event.pointerId);
		emitChange();
	}

	function handleClear() {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) {
			return;
		}
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		setHasStrokes(false);
		onChange("", lastMethodRef.current);
	}

	return (
		<div className="space-y-2">
			<div className="relative">
				<canvas
					ref={canvasRef}
					style={{ height, touchAction: "none" }}
					className="w-full cursor-crosshair rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border-subtle)] bg-canvas"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerLeave={handlePointerUp}
					aria-label="Área para firmar con el dedo o el mouse"
				/>
				{!hasStrokes && (
					<p
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-stone"
					>
						Firme aquí
					</p>
				)}
			</div>
			<div className="flex justify-end">
				<button
					type="button"
					onClick={handleClear}
					disabled={!hasStrokes}
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:opacity-40"
				>
					<Eraser className="size-3.5" aria-hidden="true" />
					Limpiar firma
				</button>
			</div>
		</div>
	);
}
