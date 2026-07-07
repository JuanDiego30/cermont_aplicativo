"use client";

import { Check, Eraser } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface Props {
	signerName: string;
	title: string;
	onSign: (signatureDataUrl: string) => void;
}

export function DigitalSignaturePad({ signerName, title, onSign }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [hasSignature, setHasSignature] = useState(false);

	const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		setIsDrawing(true);
		setHasSignature(true);
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}
		ctx.beginPath();
		const rect = canvas.getBoundingClientRect();
		const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
		const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;
		ctx.moveTo(x, y);
	}, []);

	const draw = useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			if (!isDrawing) {
				return;
			}
			e.preventDefault();
			const canvas = canvasRef.current;
			if (!canvas) {
				return;
			}
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				return;
			}
			const rect = canvas.getBoundingClientRect();
			const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
			const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;
			ctx.lineTo(x, y);
			ctx.stroke();
		},
		[isDrawing],
	);

	const stopDrawing = useCallback(() => {
		setIsDrawing(false);
	}, []);

	const clearCanvas = () => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		setHasSignature(false);
	};

	const handleSign = () => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		onSign(canvas.toDataURL("image/png"));
	};

	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6">
			<p className="mb-1 text-sm font-semibold text-[var(--text-primary)]">{title}</p>
			<p className="mb-4 text-xs text-[var(--text-secondary)]">Firmante: {signerName}</p>

			<canvas
				ref={canvasRef}
				width={400}
				height={150}
				className="w-full cursor-crosshair rounded-md border border-[var(--border-medium)] bg-white"
				onMouseDown={startDrawing}
				onMouseMove={draw}
				onMouseUp={stopDrawing}
				onMouseLeave={stopDrawing}
				onTouchStart={startDrawing}
				onTouchMove={draw}
				onTouchEnd={stopDrawing}
			/>

			<div className="mt-4 flex gap-3">
				<button
					type="button"
					onClick={clearCanvas}
					className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs text-[var(--text-secondary)]"
				>
					<Eraser className="size-3" aria-hidden="true" /> Limpiar
				</button>
				<button
					type="button"
					onClick={handleSign}
					disabled={!hasSignature}
					className="flex items-center gap-1 rounded-full bg-[var(--color-brand-blue)] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
				>
					<Check className="size-3" aria-hidden="true" /> Aceptar
				</button>
			</div>
		</div>
	);
}
