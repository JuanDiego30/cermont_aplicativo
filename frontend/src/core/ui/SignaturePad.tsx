"use client";

import { useRef, useState } from "react";

interface SignaturePadProps {
	onSave: (dataUrl: string) => void;
	width?: number;
	height?: number;
}

export function SignaturePad({ onSave, width = 400, height = 150 }: SignaturePadProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [hasSignature, setHasSignature] = useState(false);

	const startDrawing = (
		e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
	) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		setIsDrawing(true);
		ctx.beginPath();
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		ctx.lineCap = "round";

		const rect = canvas.getBoundingClientRect();
		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
		ctx.moveTo(clientX - rect.left, clientY - rect.top);
	};

	const draw = (
		e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
	) => {
		if (!isDrawing) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
		ctx.lineTo(clientX - rect.left, clientY - rect.top);
		ctx.stroke();
		setHasSignature(true);
	};

	const stopDrawing = () => {
		setIsDrawing(false);
	};

	const clearSignature = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		setHasSignature(false);
	};

	const handleSave = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const dataUrl = canvas.toDataURL("image/png");
		onSave(dataUrl);
	};

	return (
		<div className="inline-flex flex-col gap-2">
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				className="cursor-crosshair rounded-lg border border-[var(--border-default)] bg-white"
				aria-label="Área de firma"
				onMouseDown={startDrawing}
				onMouseMove={draw}
				onMouseUp={stopDrawing}
				onMouseLeave={stopDrawing}
				onTouchStart={startDrawing}
				onTouchMove={draw}
				onTouchEnd={stopDrawing}
			/>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={clearSignature}
					className="rounded-full px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				>
					Limpiar
				</button>
				<button
					type="button"
					onClick={handleSave}
					disabled={!hasSignature}
					className="rounded-full bg-[#2154A6] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1a4390] disabled:opacity-50"
				>
					Guardar firma
				</button>
			</div>
		</div>
	);
}
